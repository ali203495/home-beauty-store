import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { db } from '../utils/db'
import { orders, orderItems, products } from '../database/schema'
import { eq, sql, and, gte } from 'drizzle-orm'
import { useSearch } from '../utils/search'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
   maxRetriesPerRequest: null,
})

export default defineNitroPlugin(() => {
  if (process.env.START_WORKERS === 'true') {
    console.log('🚀 [BIG TECH] Background Workers Online')

    /**
     * 🏁 FULFILLMENT SERVICE WORKER
     * Handles Asynchronous ACID Order Settlements
     */
    new Worker('notifications', async (job) => {
      if (job.name !== 'send-confirmation') return // Only handle actual fulfillment here for now
      
      const orderData = job.data

      try {
        await db.transaction(async (tx) => {
          // 1. Transactional Idempotency Check (Final Guard)
          const [exists] = await tx.select().from(orders).where(eq(orders.checkoutId, orderData.checkoutId))
          if (exists) return

          // 2. Atomic Stock Verification & Decrement
          for (const item of orderData.items) {
            const [updated] = await tx
              .update(products)
              .set({ stock: sql`${products.stock} - ${item.quantity}` })
              .where(and(
                eq(products.id, item.productId),
                gte(products.stock, item.quantity)
              ))
              .returning()

            if (!updated) throw new Error(`OUT_OF_STOCK: ${item.productId}`)
          }

          // 3. Create Persistent Order Record
          const [newOrder] = await tx.insert(orders).values({
            userId: orderData.userId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            shippingAddress: orderData.shippingAddress,
            totalAmount: String(orderData.totalAmount),
            checkoutId: orderData.checkoutId,
            status: 'processing'
          }).returning()

          // 4. Create Order Items
          await tx.insert(orderItems).values(
            orderData.items.map((i: any) => ({
              orderId: newOrder.id,
              productId: i.productId,
              quantity: i.quantity,
              priceAtTime: String(i.priceAtTime)
            }))
          )

          console.log(`✅ [Worker] Order Fulfilled: ${newOrder.id} (${orderData.checkoutId})`)
        })
      } catch (e: any) {
        console.error(`❌ [Fulfillment Error]:`, e.message)
        // In real production, we would alert / log to DLQ here
        throw e // Allow BullMQ retry
      }
    }, { connection })

    // ... Other workers for Search sync and Analytics remain the same
  }
})

import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { db } from '../utils/db'
import { orders, orderItems, products } from '../database/schema'
import { eq, sql, and, gte } from 'drizzle-orm'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
   maxRetriesPerRequest: null,
})

export default defineNitroPlugin(() => {
  if (process.env.START_WORKERS === 'true') {
    /**
     * 🏗️ HORIZONTALLY SCALABLE FULFILLMENT WORKER
     * Concurrency: 10 (Processing 10 orders per instance simultaneously)
     */
    new Worker('notifications', async (job) => {
      if (job.name !== 'send-confirmation') return
      
      const orderData = job.data

      // 1. STATE MACHINE: Mark as 'processing'
      await db.update(orders).set({ status: 'processing', updatedAt: new Date() }).where(eq(orders.id, orderData.id))

      try {
        await db.transaction(async (tx) => {
          // 2. ATOMIC STOCK SETTLEMENT
          for (const item of orderData.items) {
             const [updated] = await tx
               .update(products)
               .set({ stock: sql`${products.stock} - ${item.quantity}` })
               .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
               .returning()

             if (!updated) throw new Error(`STOCK_EXHAUSTED: ${item.productId}`)
          }

          // 3. PERSIST ITEM MAPPING
          await tx.insert(orderItems).values(
            orderData.items.map((i: any) => ({
              orderId: orderData.id,
              productId: i.productId,
              quantity: i.quantity,
              priceAtTime: String(i.priceAtTime)
            }))
          )

          // 4. STATE MACHINE: Finalize as 'completed'
          await tx.update(orders).set({ status: 'completed' }).where(eq(orders.id, orderData.id))
          
          console.log(`✨ [Worker] Fulfillment Optimized: ${orderData.id}`)
        })
      } catch (e: any) {
        // 5. RECOVERY: Mark as 'failed' in DB for manual replay
        console.error(`❌ [Worker Error]:`, e.message)
        await db.update(orders).set({ status: 'failed' }).where(eq(orders.id, orderData.id))
        throw e // Allow BullMQ backoff retry
      }
    }, { 
      connection, 
      concurrency: 10,
      limiter: { max: 100, duration: 1000 } // Global Throttling: 100 jobs per second
    })
  }
})

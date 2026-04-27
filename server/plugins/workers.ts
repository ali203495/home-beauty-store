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
     * 🏗️ EXACTLY-ONCE FULFILLMENT WORKER
     */
    new Worker('fulfillment', async (job) => {
      if (job.name !== 'process-fulfillment') return
      
      const orderData = job.data

      try {
        await db.transaction(async (tx) => {
          // 1. TRANSACTIONAL GUARD: Ensure order is not already finished/processing
          const [order] = await tx.select().from(orders).where(eq(orders.id, orderData.id)).for('update')
          
          if (!order || order.status === 'completed' || order.status === 'processing') {
             console.log(`ℹ️ [Worker] Skipping already processed order: ${orderData.id}`)
             return
          }

          // 2. STATE MACHINE: Mark as 'processing'
          await tx.update(orders).set({ status: 'processing', updatedAt: new Date() }).where(eq(orders.id, orderData.id))

          // 3. ATOMIC STOCK SETTLEMENT
          for (const item of orderData.items) {
             const [updated] = await tx
               .update(products)
               .set({ stock: sql`${products.stock} - ${item.quantity}` })
               .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
               .returning()

             if (!updated) throw new Error(`STOCK_EXHAUSTED: ${item.productId}`)
          }

          // 4. PERSIST ITEM MAPPING
          await tx.insert(orderItems).values(
            orderData.items.map((i: any) => ({
              orderId: orderData.id,
              productId: i.productId,
              quantity: i.quantity,
              priceAtTime: String(i.priceAtTime)
            }))
          )

          // 5. STATE MACHINE: Finalize as 'completed'
          await tx.update(orders).set({ status: 'completed' }).where(eq(orders.id, orderData.id))
          
          console.log(`✨ [Worker] Successfully fulfilled: ${orderData.id}`)
        })
      } catch (e: any) {
        console.error(`❌ [Worker Error]:`, e.message)
        await db.update(orders).set({ status: 'failed' }).where(eq(orders.id, orderData.id))
        throw e // Trigger BullMQ retry
      }
    }, { 
      connection, 
      concurrency: 10,
      limiter: { max: 50, duration: 1000 }
    })

    /**
     * 🏥 AUTOMATED RECOVERY JOB
     * Scans for 'pending' orders older than 5 minutes that failed to queue
     */
    setInterval(async () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000)
      const pendingOrders = await db.query.orders.findMany({
        where: (o, { and, eq, lt }) => and(eq(o.status, 'pending'), lt(o.createdAt, fiveMinsAgo)),
        limit: 50
      })

      for (const order of pendingOrders) {
         console.warn(`🚑 [Recovery] Rescuing stuck order: ${order.id}`)
         await emitEvent('order.created', JSON.parse(order.metadata || '{}'))
         await db.update(orders).set({ status: 'queued' }).where(eq(orders.id, order.id))
      }
    }, 60 * 1000) // Run every minute
  }
})

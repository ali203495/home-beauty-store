import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { db } from '../utils/db'
import { orders, orderItems, products } from '../database/schema'
import { eq, sql, and, gte } from 'drizzle-orm'
import { metrics } from '../utils/metrics'
import { emitEvent } from '../utils/bus'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
   maxRetriesPerRequest: null,
})

export default defineNitroPlugin(() => {
  if (process.env.START_WORKERS === 'true') {
    /**
     * 🔄 COMPATIBILITY DRAINER (MIGRATION STRATEGY)
     * LISTENS TO OLD QUEUE AND MIGRATE JOBS TO NEW ARCHITECTURE
     * Prevents orphaning existing jobs during deployment switch.
     */
    new Worker('notifications', async (job) => {
      console.warn(`🔄 [Migration] Draining legacy job ${job.id} to fulfillment queue`)
      await emitEvent('order.created', job.data)
    }, { connection, concurrency: 5 })

    /**
     * 🏗️ CORE fulfillment WORKER IMPLEMENTATION
     */
    const worker = new Worker('fulfillment', async (job) => {
      if (job.name !== 'process-fulfillment') return
      const orderData = job.data

      try {
        await db.transaction(async (tx) => {
          // 1. TRANSACTIONAL GUARD WITH FOR UPDATE LOCK
          const [order] = await tx.select().from(orders).where(eq(orders.id, orderData.id)).for('update')
          
          if (!order || order.status === 'completed' || order.status === 'processing') {
             return
          }

          await tx.update(orders).set({ status: 'processing', updatedAt: new Date() }).where(eq(orders.id, orderData.id))

          for (const item of orderData.items) {
             const [updated] = await tx
               .update(products)
               .set({ stock: sql`${products.stock} - ${item.quantity}` })
               .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
               .returning()

             if (!updated) throw new Error(`STOCK_EXHAUSTED: ${item.productId}`)
          }

          await tx.insert(orderItems).values(
            orderData.items.map((i: any) => ({
              orderId: orderData.id,
              productId: i.productId,
              quantity: i.quantity,
              priceAtTime: String(i.priceAtTime)
            }))
          )

          await tx.update(orders).set({ status: 'completed' }).where(eq(orders.id, orderData.id))
          
          // LATENCY METRIC
          const latency = Date.now() - new Date(order.createdAt).getTime()
          metrics.recordLatency(latency)
          metrics.increment('fulfillment_success')
          
          console.log(`✨ [Worker] Fulfillment Success: ${orderData.id} (${latency}ms)`)
        })
      } catch (e: any) {
        console.error(`❌ [Worker Error] Order ${orderData.id}:`, e.message)
        throw e // Rethrow for BullMQ retry logic
      }
    }, { connection, concurrency: 10, limiter: { max: 50, duration: 1000 } })

    // --- JOB EVENT LISTENERS (DLQ & METRICS) ---
    worker.on('failed', async (job, err) => {
      if (!job) return
      metrics.increment('fulfillment_failed')
      
      const orderId = job.data.id
      const attempts = job.attemptsMade
      
      // AUTO-QUARANTINE (DLQ)
      if (attempts >= (job.opts.attempts || 5)) {
        console.error(`🚨 [DLQ] Order ${orderId} reached max retries. Quarantined.`)
        await db.update(orders).set({ status: 'failed', updatedAt: new Date() }).where(eq(orders.id, orderId))
        metrics.increment('dlq_quarantine')
      }
    })

    console.log('✅ [Worker] Fulfillment Engine Active.')
  }
})

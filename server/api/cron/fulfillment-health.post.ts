import { db } from '../../utils/db'
import { orders } from '../../database/schema'
import { eq, lt, and, or, sql } from 'drizzle-orm'
import { emitEvent } from '../../utils/bus'

/**
 * 🚑 ELITE RECOVERY CRON
 * Designed for Vercel Cron Jobs (runs every 5-10 mins).
 * Rescues 'pending' orders that missed the queue without persistent background processes.
 */
export default defineEventHandler(async (event) => {
  // 1. VERIFY CRON AUTH (Vercel Secret)
  const authHeader = getHeader(event, 'Authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized Cron' })
  }

  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  console.log('🚑 [Cron] Scanning for stuck orders...')

  const stuckOrders = await db.query.orders.findMany({
    where: (o, { and, eq, lt, or }) => and(
      eq(o.status, 'pending'),
      lt(o.createdAt, fiveMinsAgo),
      lt(o.recoveryCount, 3), 
      or(sql`${o.lastAttemptAt} IS NULL`, lt(o.lastAttemptAt, oneHourAgo))
    ),
    limit: 10
  })

  const results = []

  for (const order of stuckOrders) {
     try {
       console.warn(`🚑 [Recovery] Rescuing order ${order.id}`)
       
       // Re-trigger fulfillment event
       await emitEvent('order.created', JSON.parse(order.metadata || '{}'))
       
       await db.update(orders).set({ 
         status: 'queued', 
         recoveryCount: order.recoveryCount + 1,
         lastAttemptAt: new Date()
       }).where(eq(orders.id, order.id))
       
       results.push({ id: order.id, status: 'rescued' })
     } catch (err: any) {
       console.error(`💥 [Recovery Failed] Order ${order.id}:`, err.message)
       results.push({ id: order.id, status: 'failed', error: err.message })
     }
  }

  return {
    processed: results.length,
    results,
    timestamp: new Date().toISOString()
  }
})

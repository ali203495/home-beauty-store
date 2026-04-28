import { OrderSchema } from '../utils/validation'
import { emitEvent, queues } from '../utils/bus'
import { db } from '../utils/db'
import { orders } from '../database/schema'
import { eq, and } from 'drizzle-orm'
import { metrics } from '../utils/metrics'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  const result = OrderSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: result.error.errors })
  }

  const orderData = result.data

  // 1. BACKPRESSURE: Check Fulfillment Queue Depth
  // High-scale protection: fail fast if the workers are falling behind
  const jobCount = await (await queues.fulfillment.getJobCounts()).waiting
  if (jobCount > 2000) {
    throw createError({ statusCode: 503, statusMessage: 'System Busy (High Load). Please retry in 30s.' })
  }

    // 2. STABILITY: DB-First Transactional Logic
    // We do NOT use complex queues. We write to PG immediately.
    try {
      const [newOrder] = await db.insert(orders).values({
        userId: session.user?.id || null,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        totalAmount: String(orderData.totalAmount),
        checkoutId: orderData.checkoutId,
        status: 'pending',
        metadata: JSON.stringify(orderData)
      }).onConflictDoNothing().returning()

      if (!newOrder) {
        // Idempotency: Return existing order status if duplicate checkout_id detected
        const existing = await db.query.orders.findFirst({ where: eq(orders.checkoutId, orderData.checkoutId) })
        return { success: true, status: existing?.status || 'completed', checkoutId: orderData.checkoutId }
      }

      // 3. RECOVERY ASSURANCE: Update to queued. 
      // The worker/cron job will pick this up.
      await db.update(orders).set({ status: 'queued' }).where(eq(orders.id, newOrder.id))

      return { 
        success: true, 
        status: 'queued', 
        checkoutId: orderData.checkoutId 
      }

    } catch (error: any) {
      console.error('💥 [Critical] Order Database Failure:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Internal Store Error. Order not placed.' })
    }
})



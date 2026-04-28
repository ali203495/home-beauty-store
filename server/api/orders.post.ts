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

    // 2. ULTIMATE DURABILITY: DB-First with Fall-Forward Buffer
    // If the DB is unreachable, we buffer in Redis to 'never lose a sale'
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
        const existing = await db.query.orders.findFirst({ where: eq(orders.checkoutId, orderData.checkoutId) })
        return { success: true, status: existing?.status || 'completed', checkoutId: orderData.checkoutId }
      }

      // 4. DISPATCH: Let Inngest handle fulfillment in the background
      await emitEvent('order.created', { ...orderData, id: newOrder.id })

      return { success: true, status: 'queued', checkoutId: orderData.checkoutId }

    } catch (error: any) {
      console.error('⚠️ [Postgres Primary Down] Falling back to Persistence Buffer.')
      
      // FALL-FORWARD PATTERN
      const cache = useServerCache()
      await cache.set(`order-buffer:${orderData.checkoutId}`, orderData, 86400) // 24h safety buffer
      
      // Dispatch a 'recovery-only' event
      await emitEvent('order.buffered', { checkoutId: orderData.checkoutId })

      return { 
        success: true, 
        status: 'buffered', 
        message: 'Order received and secured in backup storage.',
        checkoutId: orderData.checkoutId 
      }
    }
})


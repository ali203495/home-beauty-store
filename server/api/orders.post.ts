import { OrderSchema } from '../utils/validation'
import { emitEvent, queues } from '../utils/bus'
import { db } from '../utils/db'
import { orders } from '../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  const result = OrderSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: result.error.errors })
  }

  const orderData = result.data

  // 1. BACKPRESSURE: Check Queue Depth
  const jobCount = await (await queues.notifications.getJobCounts()).waiting
  if (jobCount > 5000) {
    throw createError({ statusCode: 503, statusMessage: 'System Busy. Please retry in a few seconds.' })
  }

  // 2. ULTIMATE DURABILITY: DB-First Dual Write
  // Even if Redis crashes, the order exists in PG with 'pending' status
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
      metadata: JSON.stringify(orderData) // Backup copy of the intent
    }).onConflictDoNothing().returning()

    // 3. ATOMIC IDEMPOTENCY: If conflict (already processed)
    if (!newOrder) {
      const existing = await db.query.orders.findFirst({ where: eq(orders.checkoutId, orderData.checkoutId) })
      return { success: true, status: existing?.status || 'completed', checkoutId: orderData.checkoutId }
    }

    // 4. DISPATCH TO QUEUE: With Priority
    // If this fails, the 'pending' recovery job will pick it up from PG later
    await emitEvent('order.created', {
       ...orderData,
       id: newOrder.id,
       userId: session.user?.id || null
    })

    // 5. UPDATE STATUS TO QUEUED
    await db.update(orders).set({ status: 'queued' }).where(eq(orders.id, newOrder.id))

    return { 
       success: true, 
       status: 'queued',
       checkoutId: orderData.checkoutId
    }

  } catch (error: any) {
    console.error('💥 Dual-Write Failure:', error)
    throw createError({ statusCode: 500, statusMessage: 'Checkout Critical Error' })
  }
})

import { OrderSchema } from '../../utils/validation'
import { emitEvent } from '../../utils/bus'
import { db } from '../../utils/db'
import { orders } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  // 1. Validation (Immediate)
  const result = OrderSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: result.error.errors })
  }

  const orderData = result.data

  // 2. IDEMPOTENCY CHECK (Fast Read)
  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.checkoutId, orderData.checkoutId)
  })

  if (existingOrder) {
    return { 
       success: true, 
       status: 'already_exists',
       order: existingOrder 
    }
  }

  // 3. ASYNCHRONOUS DISPATCH (Zero Blocking)
  // We send the entire order data to the queue for worker processing
  await emitEvent('order.created', {
     ...orderData,
     userId: session.user?.id || null
  })

  // 4. RETURN INSTANT STATUS
  return { 
     success: true, 
     status: 'processing',
     checkoutId: orderData.checkoutId,
     message: 'Your order is being processed by our Marrakech fulfillment engine.'
  }
})

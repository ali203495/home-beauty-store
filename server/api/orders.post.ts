import { db } from '../../utils/db'
import { orders, orderItems } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  const { customerName, customerEmail, customerPhone, shippingAddress, totalAmount, items } = body

  if (!customerName || !customerPhone || !items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Full information and cart items required' })
  }

  // 1. Create main Order record
  const [newOrder] = await db.insert(orders).values({
    userId: session.user?.id || null, // Allow guest orders
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    totalAmount: String(totalAmount),
    status: 'pending'
  }).returning()

  // 2. Create Order Items
  const itemsToInsert = items.map((i: any) => ({
    orderId: newOrder.id,
    productId: i.productId,
    quantity: i.quantity,
    priceAtTime: String(i.priceAtTime)
  }))

  await db.insert(orderItems).values(itemsToInsert)

  return { 
     success: true, 
     orderId: newOrder.id 
  }
})

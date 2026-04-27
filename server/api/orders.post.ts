import { db } from '../../utils/db'
import { orders, orderItems } from '../../database/schema'
import { OrderSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  // 1. Strict Validation using Zod
  const result = OrderSchema.safeParse(body)
  if (!result.success) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Validation Failed',
      data: result.error.errors 
    })
  }

  const { customerName, customerEmail, customerPhone, shippingAddress, totalAmount, items } = result.data

  // 2. Database Transaction: Order + Items
  try {
    const [newOrder] = await db.insert(orders).values({
      userId: session.user?.id || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      totalAmount: String(totalAmount),
      status: 'pending',
      whatsappClicked: false
    }).returning()

    const itemsToInsert = items.map((i) => ({
      orderId: newOrder.id,
      productId: i.productId,
      quantity: i.quantity,
      priceAtTime: String(i.priceAtTime)
    }))

    await db.insert(orderItems).values(itemsToInsert)

    return { 
       success: true, 
       order: { ...newOrder, items } 
    }
  } catch (error) {
    console.error('Order creation failed:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Database Error' })
  }
})

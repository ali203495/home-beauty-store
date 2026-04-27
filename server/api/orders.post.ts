import { db } from '../../utils/db'
import { orders, orderItems, products } from '../../database/schema'
import { OrderSchema } from '../../utils/validation'
import { eq, sql, and, gte } from 'drizzle-orm'
import { emitEvent } from '../../utils/bus'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  const result = OrderSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: result.error.errors })
  }

  const { customerName, customerEmail, customerPhone, shippingAddress, totalAmount, items } = result.data

  // PRODUCTION CRITICAL: Transactional Atomic Stock Decrement
  try {
    return await db.transaction(async (tx) => {
      // 1. Check & Decrement Stock for every item atomically
      for (const item of items) {
        const [updatedProduct] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(
            and(
              eq(products.id, item.productId),
              gte(products.stock, item.quantity) // PREVENT OVERSELL
            )
          )
          .returning()

        if (!updatedProduct) {
          throw createError({ 
            statusCode: 409, 
            statusMessage: `Stock insufficient for Product ID: ${item.productId}` 
          })
        }
      }

      // 2. Create the Order
      const [newOrder] = await tx.insert(orders).values({
        userId: session.user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        totalAmount: String(totalAmount),
        status: 'pending',
        whatsappClicked: false
      }).returning()

      // 3. Create Order Items
      const itemsToInsert = items.map((i) => ({
        orderId: newOrder.id,
        productId: i.productId,
        quantity: i.quantity,
        priceAtTime: String(i.priceAtTime)
      }))

      await tx.insert(orderItems).values(itemsToInsert)

      // BIG-TECH: Emit Background Events (Asynchronous)
      emitEvent('order.created', {
         id: newOrder.id,
         total: totalAmount,
         email: customerEmail,
         phone: customerPhone
      })

      return { 
         success: true, 
         order: { ...newOrder, items } 
      }
    })
  } catch (error: any) {
    console.error('Order Transaction Failed:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.statusMessage || 'Internal Order Error' 
    })
  }
})

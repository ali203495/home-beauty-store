import { db } from '../../../utils/db'
import { products } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const id = Number(getRouterParam(event, 'id'))
  const method = event.method

  if (method === 'PUT') {
    const body = await readBody(event)
    
    // Ensure numeric types
    const data = { ...body }
    if (data.price) data.price = Number(data.price)
    if (data.salePrice) data.salePrice = Number(data.salePrice)
    if (data.stock) data.stock = Number(data.stock)
    if (data.categoryId) data.categoryId = Number(data.categoryId)
    if (data.brandId) data.brandId = Number(data.brandId)
    if (data.images && typeof data.images !== 'string') data.images = JSON.stringify(data.images)
    if (data.specifications && typeof data.specifications !== 'string') data.specifications = JSON.stringify(data.specifications)
    if (data.tags && typeof data.tags !== 'string') data.tags = JSON.stringify(data.tags)

    const [updated] = await db.update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning()
    return updated
  }

  if (method === 'DELETE') {
    await db.delete(products).where(eq(products.id, id))
    return { success: true }
  }
})

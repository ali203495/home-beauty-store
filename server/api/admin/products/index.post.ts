import { db } from '../../../../../utils/db'
import { products } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { 
    name, slug, description, price, salePrice, stock, 
    images, categoryId, brandId, isFeatured, isActive,
    specifications, tags
  } = body

  if (!name || !slug || !price) {
    throw createError({ statusCode: 400, statusMessage: 'Name, slug and price are required' })
  }

  // Enterprise Security: Validate Image Size
  const imageStr = typeof images === 'string' ? images : JSON.stringify(images || [])
  if (imageStr.length > 1.5 * 1024 * 1024) {
     throw createError({ statusCode: 413, statusMessage: 'Image data too large' })
  }

  const [newProduct] = await db.insert(products).values({
    name, slug, description, 
    price: Number(price), 
    salePrice: salePrice ? Number(salePrice) : null,
    stock: Number(stock) || 0,
    images: imageStr,
    categoryId: Number(categoryId),
    brandId: Number(brandId),
    isFeatured: !!isFeatured,
    isActive: isActive !== undefined ? !!isActive : true,
    specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}),
    tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
  }).returning()

  return newProduct
})

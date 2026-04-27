import { db } from '../utils/db'
import { products } from '../database/schema'
import { eq, or, and, ilike, sql } from 'drizzle-orm'
import { useServerCache } from '../utils/cache'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { category, brand, featured, search, page = 1, limit = 20 } = query
  const cache = useServerCache()

  // 1. Generate unique cache key based on query params
  const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${featured || 'false'}:${search || 'none'}:${page}:${limit}`
  
  const cached = await cache.get<any>(cacheKey)
  if (cached) return cached

  // 2. Database logic
  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(100, Math.max(1, Number(limit)))
  const offset = (pageNum - 1) * limitNum

  const conditions = []
  if (category) conditions.push(eq(products.categoryId, Number(category)))
  if (brand) conditions.push(eq(products.brandId, Number(brand)))
  if (featured === 'true') conditions.push(eq(products.isFeatured, true))
  
  if (search) {
     const searchStr = `%${String(search).trim()}%`
     conditions.push(or(
        ilike(products.name, searchStr),
        ilike(products.description, searchStr)
     ))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db.query.products.findMany({
      where,
      with: { category: true, brand: true },
      limit: limitNum,
      offset: offset,
      orderBy: [sql`${products.updatedAt} DESC`]
    }),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where)
  ])

  const total = countResult[0].count
  const responseData = {
    items,
    metadata: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  }

  // 3. Cache Result (TTL: 10 Minutes for products to catch price/stock updates)
  await cache.set(cacheKey, responseData, 600)

  return responseData
})

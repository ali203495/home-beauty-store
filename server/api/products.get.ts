import { db } from '../utils/db'
import { products } from '../database/schema'
import { eq, and, sql } from 'drizzle-orm'
import { useServerCache } from '../utils/cache'
import { useSearch } from '../utils/search'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { category, brand, featured, search: searchStr, page = 1, limit = 20 } = query
  const cache = useServerCache()
  const meilisearch = useSearch()

  const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${featured || 'false'}:${searchStr || 'none'}:${page}:${limit}`
  const cached = await cache.get<any>(cacheKey)
  if (cached) return cached

  let items = []
  let total = 0
  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(100, Math.max(1, Number(limit)))
  const offset = (pageNum - 1) * limitNum

  // BIG-TECH: If search query exists, use Meilisearch Index
  if (searchStr) {
     const searchResult = await meilisearch.search(String(searchStr), { category })
     if (searchResult) {
        items = searchResult.hits
        total = searchResult.estimatedTotalHits || searchResult.hits.length
        
        // Final response for search results
        const responseData = { items, metadata: { total, page: 1, limit: items.length, totalPages: 1 } }
        await cache.set(cacheKey, responseData, 600)
        return responseData
     }
  }

  // STANDARD: Catalog Browsing via Postgres
  const conditions = []
  if (category) conditions.push(eq(products.categoryId, Number(category)))
  if (brand) conditions.push(eq(products.brandId, Number(brand)))
  if (featured === 'true') conditions.push(eq(products.isFeatured, true))
  
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [dbItems, countResult] = await Promise.all([
    db.query.products.findMany({
      where,
      with: { category: true, brand: true },
      limit: limitNum,
      offset: offset,
      orderBy: [sql`${products.updatedAt} DESC`]
    }),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where)
  ])

  total = countResult[0].count
  const responseData = {
    items: dbItems,
    metadata: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
  }

  await cache.set(cacheKey, responseData, 600)
  return responseData
})

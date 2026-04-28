import { useDb } from '../utils/db'
import { products } from '../database/schema'
import { eq, and, sql } from 'drizzle-orm'
import { useServerCache } from '../utils/cache'
import { useSearch } from '../utils/search'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const { category, brand, featured, search: searchStr, page = 1, limit = 20 } = query
  const cache = useServerCache()
  const meilisearch = useSearch()
  const config = useRuntimeConfig(event)
  const edgeId = config.edgeConfigId || process.env.EDGE_CONFIG_ID
  const edgeToken = config.edgeConfigToken || process.env.EDGE_CONFIG_TOKEN

  // 0. ELITE TIER: Edge Config Bypass (Safety Gated)
  if (edgeId && edgeToken && !searchStr) {
     try {
       const hotProducts = await $fetch(`https://edge-config.vercel.com/${edgeId}/get/hot_products`, {
          headers: { Authorization: `Bearer ${edgeToken}` },
          timeout: 2000
       })
       if (hotProducts && (hotProducts as any)[String(category) || 'all']) {
          console.log('⚡ [Edge Config] Serving Hot Catalog')
          return (hotProducts as any)[String(category) || 'all']
       }
     } catch (e: any) {
        console.warn('⚠️ [Edge Bypass] Failed or Timed Out:', e.message)
        // Fall back gracefully to standard Postgres path
     }
  }

  // 1. Edge-Level SWR Cache (Standard Path)
  setHeader(event, 'Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')

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

  // 2. Edge-Level SWR Cache (50ms catalog)
  // Store in Vercel CDN for 1 hour, serve stale for 1 day while revalidating
  setHeader(event, 'Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')

  await cache.set(cacheKey, responseData, 600)
  return responseData
})

import { db } from '../utils/db'
import { products } from '../database/schema'
import { eq, inArray } from 'drizzle-orm'
import { useServerCache } from '../utils/cache'

export default defineEventHandler(async (event) => {
  const cache = useServerCache()
  const cacheKey = 'daily-deals'

  // 1. Try Cache First
  const cachedData = await cache.get<any[]>(cacheKey)
  if (cachedData) return cachedData

  // 2. Database Fallback
  const pool = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.isActive, true))
    .limit(100)

  if (pool.length === 0) return []

  const shuffled = pool.sort(() => 0.5 - Math.random())
  const selectedIds = shuffled.slice(0, 4).map(p => p.id)

  const items = await db.query.products.findMany({
    where: inArray(products.id, selectedIds),
    with: { brand: true }
  })

  const results = items.map(p => {
    const originalPrice = Number(p.price)
    const cost = p.costPrice ? Number(p.costPrice) : originalPrice * 0.7
    const discountPerc = Math.floor(Math.random() * 31) + 20 
    let dealPrice = originalPrice * (1 - discountPerc / 100)
    if (dealPrice < cost) dealPrice = cost * 1.1

    return {
       ...p,
       dealPrice: Number(dealPrice.toFixed(2)),
       discountPercentage: Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
    }
  })

  // 3. Save to Global Cache (TTL: 1 Hour)
  await cache.set(cacheKey, results, 3600)

  return results
})

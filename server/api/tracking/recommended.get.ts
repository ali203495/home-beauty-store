import { db } from '../../utils/db'
import { userViews, products } from '../../database/schema'
import { eq, desc, inArray, notInArray, sql, and } from 'drizzle-orm'
import { useServerCache } from '../../utils/cache'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const cache = useServerCache()
  
  // 1. User-Specific Cache Key
  const cacheKey = `recommended:${session.user?.id || 'guest'}:${session.id}`
  const cached = await cache.get<any[]>(cacheKey)
  if (cached) return cached

  // 2. Recommendation Engine Logic
  const recentViews = await db.query.userViews.findMany({
    where: (uv, { or, eq }) => or(
       eq(uv.sessionId, session.id),
       session.user?.id ? eq(uv.userId, session.user.id) : undefined
    ),
    orderBy: [desc(userViews.viewedAt)],
    limit: 20,
    with: { product: true }
  })

  let recommendations = []

  if (recentViews.length === 0) {
    recommendations = await db.query.products.findMany({
      where: eq(products.isFeatured, true),
      limit: 6
    })
  } else {
    const productIds = recentViews.map(v => v.productId as number)
    const categoryIds = recentViews.map(v => v.product?.categoryId).filter(id => id !== null) as number[]
    const uniqueCats = [...new Set(categoryIds)]

    recommendations = await db.query.products.findMany({
      where: and(
         inArray(products.categoryId, uniqueCats),
         notInArray(products.id, productIds)
      ),
      orderBy: [desc(products.createdAt)],
      limit: 6
    })
  }

  // 3. Cache for 5 minutes (personalization changes faster)
  await cache.set(cacheKey, recommendations, 300)

  return recommendations
})

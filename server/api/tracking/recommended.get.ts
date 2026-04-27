import { db } from '../../utils/db'
import { userViews, products } from '../../database/schema'
import { eq, desc, inArray, notInArray, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  // 1. Get user's last 20 views
  const recentViews = await db.query.userViews.findMany({
    where: (uv, { or, eq }) => or(
       eq(uv.sessionId, session.id),
       session.user?.id ? eq(uv.userId, session.user.id) : undefined
    ),
    orderBy: [desc(userViews.viewedAt)],
    limit: 20,
    with: {
       product: true
    }
  })

  // If no history, return standard featured products
  if (recentViews.length === 0) {
    return await db.query.products.findMany({
      where: eq(products.isFeatured, true),
      limit: 6
    })
  }

  // 2. Identify top categories from history
  const productIds = recentViews.map(v => v.productId as number)
  const categoryIds = recentViews.map(v => v.product?.categoryId).filter(id => id !== null) as number[]
  
  // 3. Find unique category seeds
  const uniqueCats = [...new Set(categoryIds)]

  // 4. Fetch products in those categories that the user hasn't seen yet
  return await db.query.products.findMany({
    where: and(
       inArray(products.categoryId, uniqueCats),
       notInArray(products.id, productIds)
    ),
    orderBy: [desc(products.createdAt)], // Use recency instead of RANDOM for scale
    limit: 6
  })
})

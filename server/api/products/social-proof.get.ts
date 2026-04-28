import { db } from '../../utils/db'
import { userViews, orders } from '../../database/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

/**
 * 🔥 SOCIAL PROOF ENGINE
 * Returns real-time velocity data to drive conversion.
 * 100k user scale: Use SWR to ensure this never slows down the PDP.
 */
export default defineEventHandler(async (event) => {
  const { productId } = getQuery(event)
  if (!productId) return { popularity: 0, recentlyBought: 0 }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // 1. Get real view count and recent order count
  const [views, recentOrders] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(userViews)
      .where(and(eq(userViews.productId, Number(productId)), gte(userViews.viewedAt, oneHourAgo))),
    
    db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(sql`metadata->>'productId' = ${productId}`, gte(orders.createdAt, twentyFourHoursAgo)))
  ])

  // Cache at Edge for 5 minutes (low-cost social proof)
  setHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

  return {
    popularity: views[0].count,
    recentlyBought: recentOrders[0].count,
    isHot: views[0].count > 10
  }
})

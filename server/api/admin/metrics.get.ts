import { db } from '../../utils/db'
import { orders } from '../../database/schema'
import { sql, count, sum } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // 1. ADMIN AUTH
  const session = await getUserSession(event)
  if (session.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // 🏛️ REAL-TIME BUSINESS INTELLIGENCE
  const [{ totalCount }] = await db.select({ totalCount: count() }).from(orders)
  const [{ totalRevenue }] = await db.select({ totalRevenue: sum(orders.totalAmount) }).from(orders)
  
  // Get Today's Stats
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const [{ todayCount }] = await db.select({ todayCount: count() })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${todayStart.toISOString()}`)

  return {
    success: true,
    kpis: {
      total_orders: Number(totalCount),
      total_revenue: Number(totalRevenue || 0),
      today_orders: Number(todayCount),
      status: 'operational_elite'
    },
    timestamp: new Date().toISOString()
  }
})

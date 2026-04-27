// server/api/admin/stats.ts
import { db } from '../../../utils/db'
import { users, products, orders } from '../../database/schema'
import { count, sum } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const [usersCount] = await db.select({ value: count() }).from(users)
  const [productsCount] = await db.select({ value: count() }).from(products)
  const [ordersCount] = await db.select({ value: count() }).from(orders)
  const [salesSum] = await db.select({ value: sum(orders.total) }).from(orders)

  return {
    totalUsers: usersCount.value,
    totalProducts: productsCount.value,
    totalOrders: ordersCount.value,
    totalSales: salesSum.value || 0
  }
})

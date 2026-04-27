// PATCH /api/admin/orders/[id]
import { db } from '../../../utils/db'
import { orders } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session.user?.role !== 'admin') {
     throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status } = body

  if (!id || !status) {
     throw createError({ statusCode: 400, statusMessage: 'ID and Status required' })
  }

  await db.update(orders).set({ status }).where(eq(orders.id, Number(id)))

  return { success: true }
})

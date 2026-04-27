import { db } from '../../../../utils/db'
import { brands } from '../../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const id = Number(getRouterParam(event, 'id'))
  const method = event.method

  if (method === 'PUT') {
    const body = await readBody(event)
    const [updated] = await db.update(brands)
      .set(body)
      .where(eq(brands.id, id))
      .returning()
    return updated
  }

  if (method === 'DELETE') {
    await db.delete(brands).where(eq(brands.id, id))
    return { success: true }
  }
})

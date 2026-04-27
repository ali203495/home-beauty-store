import { db } from '../../../utils/db'
import { categories } from '../../../database/schema'
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
    const { name, slug, image, description, sortOrder } = body

    const [updated] = await db.update(categories)
      .set({ name, slug, image, description, sortOrder })
      .where(eq(categories.id, id))
      .returning()
    
    return updated
  }

  if (method === 'DELETE') {
    await db.delete(categories).where(eq(categories.id, id))
    return { success: true }
  }
})

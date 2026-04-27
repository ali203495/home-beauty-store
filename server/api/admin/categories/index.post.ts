import { db } from '../../../../utils/db'
import { categories } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { name, slug, image, description, sortOrder } = body

  if (!name || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'Name and slug are required' })
  }

  try {
    const [newCategory] = await db.insert(categories).values({
      name,
      slug,
      image,
      description,
      sortOrder: sortOrder || 0,
    }).returning()

    return newCategory
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create category'
    })
  }
})

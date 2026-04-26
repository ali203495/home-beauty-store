import { db } from '../../utils/db'
import { categories } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
  }

  const result = await db.query.categories.findFirst({
    where: eq(categories.slug, slug)
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return result
})

import { db } from '../../utils/db'
import { userViews } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { productId } = body
  const session = await getUserSession(event)

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID required' })
  }

  // Record the view
  await db.insert(userViews).values({
    userId: session.user?.id || null, // Handle guest views
    sessionId: session.id, // Auth utils provided session id
    productId: Number(productId)
  })

  return { success: true }
})

import { db } from '../../utils/db'
import { userViews } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { productId } = body
  const session = await getUserSession(event)

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID required' })
  }

  // 1. Check if we already recorded this view in the last 10 minutes (Protect DB Writes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const existing = await db.query.userViews.findFirst({
    where: (uv, { eq, and, gt }) => and(
       eq(uv.sessionId, session.id),
       eq(uv.productId, Number(productId)),
       gt(uv.viewedAt, tenMinutesAgo)
    )
  })

  if (existing) return { success: true, cached: true }

  // 2. Record the view uniquely (Background Execution for Speed)
  event.waitUntil(
    db.insert(userViews).values({
      userId: session.user?.id || null,
      sessionId: session.id,
      productId: Number(productId)
    })
  )

  return { success: true, async: true }
})

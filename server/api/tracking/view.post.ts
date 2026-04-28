import { db } from '../../utils/db'
import { userViews } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { productId } = body
  const session = await getUserSession(event)

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID required' })
  }

  // session.id may be undefined for anonymous users with no session cookie
  const sessionId = session?.id ?? null

  // 1. Check if we already recorded this view in the last 10 minutes (Protect DB Writes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  
  // Guard: if no sessionId or userId, we can't check for existing views uniquely
  if (!sessionId && !session.user?.id) {
     return { success: true, guest: true }
  }

  const existing = await db.query.userViews.findFirst({
    where: (uv, { eq, and, gt }) => and(
       sessionId ? eq(uv.sessionId, sessionId) : undefined,
       session.user?.id ? eq(uv.userId, String(session.user.id)) : undefined,
       eq(uv.productId, Number(productId)),
       gt(uv.viewedAt, tenMinutesAgo)
    )
  })

  if (existing) return { success: true, cached: true }

  // 2. Record the view uniquely (Background Execution for Speed)
  event.waitUntil(
    db.insert(userViews).values({
      userId: session.user?.id ? Number(session.user.id) : null,
      sessionId: sessionId,
      productId: Number(productId)
    })
  )

  return { success: true, async: true }
})

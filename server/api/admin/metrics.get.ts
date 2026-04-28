import { metrics } from '../../utils/metrics'

export default defineEventHandler(async (event) => {
  // 1. ADMIN AUTH
  const session = await getUserSession(event)
  if (session.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const query = getQuery(event)
  const format = query.format || 'json'

  // Dynamic system health metrics (No external queues)

  if (format === 'prometheus') {
    setHeader(event, 'Content-Type', 'text/plain')
    return metrics.getPrometheusFormat()
  }

  return metrics.getSnapshot()
})

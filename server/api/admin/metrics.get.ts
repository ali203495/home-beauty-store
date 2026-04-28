import { metrics } from '../../utils/metrics'
import { queues } from '../../utils/bus'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const query = getQuery(event)
  const format = query.format || 'json'

  // Update dynamic gauges
  const jobCounts = await queues.fulfillment.getJobCounts()
  metrics.setGauge('queue_depth_fulfillment', jobCounts.waiting)

  if (format === 'prometheus') {
    setHeader(event, 'Content-Type', 'text/plain')
    return metrics.getPrometheusFormat()
  }

  return metrics.getSnapshot()
})

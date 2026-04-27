import { Queue } from 'bullmq'
import Redis from 'ioredis'

// IORedis is required for BullMQ
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// 1. Initialize Specialized Queues
export const queues = {
  notifications: new Queue('notifications', { connection }),
  searchSync: new Queue('search-sync', { connection }),
  analytics: new Queue('analytics', { connection }),
}

// 2. The Central Dispatcher
export const emitEvent = async (event: string, data: any) => {
  try {
    switch (event) {
      case 'order.created':
        // Decouple notification and internal tracking
        await queues.notifications.add('send-confirmation', data, {
           attempts: 3,
           backoff: { type: 'exponential', delay: 1000 }
        })
        await queues.analytics.add('process-order-data', data)
        break

      case 'product.updated':
        await queues.searchSync.add('sync-meilisearch', data)
        break

      case 'user.viewed':
        await queues.analytics.add('track-view', data, {
           removeOnComplete: true // High volume optimization
        })
        break
    }
  } catch (e) {
    console.error(`💥 Event Bus Error [${event}]:`, e)
  }
}

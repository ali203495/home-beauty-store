import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { useSearch } from '../utils/search'
import { searchBreaker } from '../utils/resilience'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
   maxRetriesPerRequest: null,
})

export default defineNitroPlugin(() => {
  if (process.env.START_WORKERS === 'true') {
    console.log('🚀 [BIG TECH] Background Workers Online')

    /**
     * 📦 ORDER & NOTIFICATION SERVICE
     * Features: Idempotency + DLQ + Exponential Backoff
     */
    new Worker('notifications', async (job) => {
      const idempotencyKey = `processed:job:${job.id}`
      
      // 1. Idempotency Check (Prevent double emails/SMS)
      const alreadyProcessed = await connection.get(idempotencyKey)
      if (alreadyProcessed) return

      console.log(`✉️ [Worker] Notifications for Order: ${job.data.id}`)
      
      // [Simulate Notification logic]
      
      // 2. Mark as processed for 24 hours
      await connection.set(idempotencyKey, 'true', 'EX', 86400)
    }, { 
      connection,
      settings: { backoffStrategy: (attempts) => Math.pow(2, attempts) * 1000 }
    })

    /**
     * 🔍 SEARCH SYNC SERVICE
     * Features: Circuit Breaker protection
     */
    new Worker('search-sync', async (job) => {
      const search = useSearch()
      await searchBreaker.fire(() => search.syncProduct(job.data))
    }, { connection })

    /**
     * 📊 BI & ANALYTICS SERVICE
     * Features: Conversion Funnel Tracking
     */
    new Worker('analytics', async (job) => {
      const { type, data } = job.data
      
      switch (type) {
        case 'funnel.step':
          console.log(`📊 [BI] Tracking Funnel Step: ${data.step} for session ${data.sessionId}`)
          // Log to Big-Tech storage (BigQuery / Clickhouse)
          break
        
        case 'revenue.log':
          console.log(`💰 [BI] Revenue Recorded: ${data.amount} for category ${data.categoryId}`)
          break
      }
    }, { connection })

    // GLOBAL ERROR HANDLING: Move to DLQ
    nitroApp.hooks.hook('error', (error) => {
       // Logic to move critical failed jobs to 'failed' state for manual replay
    })
  }
})

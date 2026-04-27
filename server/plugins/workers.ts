import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { useSearch } from '../utils/search'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
   maxRetriesPerRequest: null,
})

export default defineNitroPlugin(() => {
  // Only start workers if not in a serverless environment or if explicitly requested
  if (process.env.START_WORKERS === 'true') {
    console.log('🚀 Starting Background Workers...')

    // 1. Notification Service Worker
    new Worker('notifications', async (job) => {
      if (job.name === 'send-confirmation') {
        console.log(`✉️ Sending Confirm Message for Order: ${job.data.id}`)
        // [Logic for Nodemailer / Twilio / WhatsApp]
      }
    }, { connection })

    // 2. Search Sync Service Worker
    new Worker('search-sync', async (job) => {
      if (job.name === 'sync-meilisearch') {
        const search = useSearch()
        await search.syncProduct(job.data)
        console.log(`🔍 Search Index Synced: ${job.data.id}`)
      }
    }, { connection })

    // 3. Analytics Service Worker
    new Worker('analytics', async (job) => {
      console.log(`📊 Processing Analytics Job: ${job.name}`)
      // [Log to external warehouse like BigQuery/Axiom]
    }, { connection })
  }
})

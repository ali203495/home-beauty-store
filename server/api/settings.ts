import { db } from '../utils/db'
import { siteSettings } from '../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
     const settingsArr = await db.query.siteSettings.findMany()
     // Convert array to object for easier use
     return settingsArr.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value
        return acc
     }, {})
  }

  if (method === 'POST') {
     const session = await getUserSession(event)
     if (session.user?.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
     }

     const body = await readBody(event)
     const { key, value } = body

     // Upsert logic
     const existing = await db.query.siteSettings.findFirst({ where: eq(siteSettings.key, key) })
     
     if (existing) {
        await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key))
     } else {
        await db.insert(siteSettings).values({ key, value })
     }
     
     return { success: true }
  }
})

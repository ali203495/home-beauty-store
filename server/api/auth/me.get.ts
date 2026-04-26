// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  return await getUserSession(event)
})

import { db } from '../../utils/db'
import { users } from '../../database/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // 1. Check for "Grand Admin" (Environment Variables) - No hardcoding
  const envAdminEmail = process.env.ADMIN_EMAIL
  const envAdminPassword = process.env.ADMIN_PASSWORD

  if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
    // Immediate Admin Access via Environment Settings
    const sessionData = {
      user: {
        id: 0, // Virtual ID for Grand Admin
        email: envAdminEmail,
        name: 'System Administrator',
        role: 'admin',
      },
      loggedInAt: new Date().toISOString(),
    }
    await setUserSession(event, sessionData)
    return { success: true, user: sessionData.user }
  }

  // 2. Fallback to Database Authentication for customers/others
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    loggedInAt: new Date().toISOString(),
  })

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
})

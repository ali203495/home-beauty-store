import { db } from '../../../utils/db'
import { users } from '../../database/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password } = body

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
  }

  // 1. Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Create user
  const [newUser] = await db.insert(users).values({
    name,
    email,
    passwordHash: hashedPassword,
    role: 'user', // Always default to user for public registration
  }).returning()

  // 4. Create session immediately
  await setUserSession(event, {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    loggedInAt: new Date().toISOString(),
  })

  return { success: true }
})

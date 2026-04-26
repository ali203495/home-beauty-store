import { db } from '../../utils/db'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // 1. Find or Create user in our DB
    let dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.email),
    })

    if (!dbUser) {
      const [newUser] = await db.insert(users).values({
        email: user.email,
        name: user.name || 'Guest User',
        passwordHash: '', // Social login users don't have a password
        role: 'user',
        // Optional: you could add an avatar field to your schema if you want to store it
      }).returning()
      dbUser = newUser
    }

    // 2. Set the session
    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
      loggedInAt: new Date().toISOString(),
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=google')
  },
})

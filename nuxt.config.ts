// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    'nuxt-auth-utils',
    'nuxt-security',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],
  security: {
    csrf: true,
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", "data:", "https://via.placeholder.com", "https://upload.wikimedia.org", "https://*.googleusercontent.com"],
      }
    }
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    sentryDsn: process.env.SENTRY_DSN,
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      }
    },
    public: {
      whatsappNumber: process.env.NUXT_PUBLIC_WHATSAPP_NUMBER || '212600000000'
    }
  },
  nitro: {
    // Prevent better-sqlite3 (native binary, unused) from being bundled into
    // the serverless output — it causes Vercel builds to fail.
    externals: {
      external: ['better-sqlite3', 'ioredis', 'bullmq']
    }
  },
  future: {
    compatibilityVersion: 4,
  },
})

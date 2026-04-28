// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: { compatibilityVersion: 4 },
  
  modules: [
    'nuxt-auth-utils',
    'nuxt-security',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],

  // 1. Production Security (Strict)
  security: {
    csrf: true,
    rateLimiter: false, // Disabling built-in memory limiter; we move to Global Redis
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", "data:", "https://*.googleusercontent.com", "https://*.neon.tech", "https://via.placeholder.com"],
      }
    }
  },

  // 2. Stateless Runtime Config
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    public: {
      whatsappNumber: process.env.NUXT_PUBLIC_WHATSAPP_NUMBER
    }
  },

  // 3. Serverless Optimization
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    minify: true,
    // Explicitly exclude native modules that crash serverless
    externals: {
      external: ['better-sqlite3', 'hiredis']
    }
  }
})


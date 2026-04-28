// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: { compatibilityVersion: 4 },
  
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    'nuxt-security',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],

  // 1. Production Security (Strict but Mobile-Ready)
  security: {
    csrf: true,
    rateLimiter: false,
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", "data:", "https://*", "https://*.neon.tech"],
        'font-src': ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'connect-src': ["'self'", "https://*", "wss://*"]
      },
      crossOriginEmbedderPolicy: 'none'
    }
  },

  // 2. Stateless Runtime Config
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    edgeConfigId: process.env.EDGE_CONFIG_ID,
    edgeConfigToken: process.env.EDGE_CONFIG_TOKEN,
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


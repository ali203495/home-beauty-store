// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: { compatibilityVersion: 4 },
  
  app: {
    head: {
      title: 'El Wali Beauty | Soins de Luxe & Cosmétiques d\'Exception',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
        { name: 'description', content: 'Découvrez l\'univers El Wali Beauty. Une sélection exclusive de cosmétiques de luxe et de soins haut de gamme, sélectionnés pour votre éclat naturel.' },
        { name: 'theme-color', content: '#000000' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'El Wali Beauty' },
        { property: 'og:image', content: 'https://home-beauty-store.vercel.app/og-prestige.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap' }
      ]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@sentry/nuxt',
    '@pinia/nuxt'
  ],

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

  // 2. Global Security & Monitoring (Passive Mode)
  sentry: {
    enabled: true,
    clientConfig: {
      dsn: process.env.NUXT_PUBLIC_SENTRY_DSN
    },
    serverConfig: {
      dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
      // 🛡️ CRITICAL: Disable automated global-hooks that crash Vercel
      instrumenter: 'sentry',
      autoInstrumentServerFunctions: false
    }
  },

  // 3. Serverless Optimization (Hardened for Vercel Serverless/Node)
  nitro: {
    preset: 'vercel-serverless',
    compressPublicAssets: true,
    minify: true
  }
})


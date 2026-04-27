// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'nuxt-auth-utils',
    'nuxt-security',
    '@nuxt/image'
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
  future: {
    compatibilityVersion: 4,
  },
})

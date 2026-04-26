export default defineEventHandler((event) => {
  return {
    status: 'success',
    message: 'Home Beauty Store API is online',
    environment: 'Nuxt 4 / Nitro',
    timestamp: new Date().toISOString(),
    features: [
      'TypeScript Backend',
      'Unified Project Structure',
      'High-Performance Nitro Server'
    ]
  }
})

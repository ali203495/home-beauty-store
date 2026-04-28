<script setup lang="ts">
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })

// PRODUCTION: Log the error to Sentry before clearing
onMounted(() => {
  console.error('💥 Production Error Captured:', props.error)
})
</script>

<template>
  <div class="production-error">
    <div class="error-container card fade-in-up">
       <div class="error-icon">🛠️</div>
       <h1 class="title-md">Something went wrong</h1>
       <p class="error-msg">We're experiencing a technical issue, but don't worry—your cart is safe.</p>
       
       <div v-if="error?.statusCode" class="error-code">
          Error: {{ error.statusCode }}
       </div>

        <div class="flex flex-col gap-4">
          <button @click="handleError" class="btn-primary">Refresh & Retry</button>
          <NuxtLink to="/contact" class="text-[10px] uppercase font-bold tracking-widest text-luxury-muted text-center hover:text-luxury-black transition-colors">Contact Support</NuxtLink>
        </div>
    </div>
  </div>
</template>

<style scoped>
.production-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
  padding: 2rem;
}

.error-container {
  max-width: 500px;
  text-align: center;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-icon { font-size: 4rem; }
.error-msg { color: var(--text-muted); line-height: 1.6; }
.error-code { font-family: monospace; font-size: 0.8rem; background: #eee; padding: 0.5rem; border-radius: 4px; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
</style>

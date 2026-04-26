<script setup lang="ts">
// Nuxt 4 index.vue
</script>

<template>
  <div class="hero-container">
    <div class="glass-card">
      <h1 class="title">Home Beauty Store <span class="v4">v4</span></h1>
      <p class="subtitle">Restarted with Nuxt 4 & TypeScript</p>
      <div class="status-badge">Backend Ready: server/api/status.ts</div>
      
      <div class="feature-grid">
        <div class="feature-item">
          <span class="icon">✨</span>
          <h3>Vue 3</h3>
          <p>Composition API with Script Setup</p>
        </div>
        <div class="feature-item">
          <span class="icon">🚀</span>
          <h3>Nuxt 4</h3>
          <p>Modern Directory Structure</p>
        </div>
        <div class="feature-item">
          <span class="icon">🛡️</span>
          <h3>TypeScript</h3>
          <p>End-to-end Type Safety</p>
        </div>
      </div>

      <NuxtLink to="/api/status" target="_blank" class="cta-button">
        Check Backend API
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #1a1a2e, #16213e);
  color: white;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem;
  border-radius: 2rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  width: 90%;
  animation: fadeIn 1s ease-out;
}

.title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.v4 {
  font-size: 1.5rem;
  vertical-align: super;
  background: #a855f7;
  -webkit-text-fill-color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  margin-bottom: 2rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 9999px;
  font-family: monospace;
  font-size: 0.875rem;
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.05);
}

.icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.feature-item h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.feature-item p {
  font-size: 0.9rem;
  color: #94a3b8;
}

.cta-button {
  display: inline-block;
  background: #6366f1;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
}

.cta-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

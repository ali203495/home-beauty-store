<script setup lang="ts">
import '~/assets/css/main.css'
const cartStore = useCartStore()
const searchInput = ref('')

// PRODUCTION: Global Hydration Guard
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })

// PRODUCTION: Global Error Boundary
onErrorCaptured((err) => {
  console.error('🚫 Global Catch:', err)
  return false // Prevent crash propagation
})

const navigateSearch = () => {
  if (searchInput.value.trim()) {
    navigateTo(`/search?q=${searchInput.value}`)
    searchInput.value = ''
  }
}
</script>

<template>
  <div class="app-layout">
    <header class="header">
      <div class="container header-inner">
        <div class="header-left">
          <NuxtLink to="/" class="logo">EL-WALI</NuxtLink>
          <nav class="nav desktop-only">
             <NuxtLink to="/products">Catalog</NuxtLink>
             <NuxtLink to="/categories/new">What's New</NuxtLink>
             <NuxtLink to="/contact">Support</NuxtLink>
          </nav>
        </div>

        <div class="header-right">
           <div class="search-bar card desktop-only">
              <input 
                v-model="searchInput" 
                @keyup.enter="navigateSearch"
                placeholder="Find a product..." 
              />
              <button @click="navigateSearch">🔍</button>
           </div>

           <div class="actions">
              <NuxtLink to="/search" class="mobile-only action-btn">🔍</NuxtLink>
              <button class="action-btn cart-btn" @click="cartStore.isCartOpen = true">
                 <span class="icon">🛒</span>
                 <!-- SSR Safe Badge -->
                 <span v-if="isMounted && cartStore.totalItems > 0" class="badge">
                    {{ cartStore.totalItems }}
                 </span>
              </button>
              <NuxtLink to="/auth/login" class="action-btn desktop-only">👤</NuxtLink>
           </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <NuxtPage />
    </main>

    <!-- Global Components -->
    <ClientOnly>
       <!-- Cart Drawer would go here -->
    </ClientOnly>
    
    <footer class="footer">
       <div class="container footer-grid">
          <div class="footer-brand">
             <div class="logo">EL-WALI</div>
             <p>The premium warehouse in the heart of Marrakech. Fast local delivery and authentic quality.</p>
          </div>
          <div class="footer-links">
             <h4>Company</h4>
             <NuxtLink to="/about">About Us</NuxtLink>
             <NuxtLink to="/contact">Contact</NuxtLink>
             <NuxtLink to="/terms">Terms of Service</NuxtLink>
          </div>
          <div class="footer-links">
             <h4>Shop</h4>
             <NuxtLink to="/categories/beauty">Beauty</NuxtLink>
             <NuxtLink to="/categories/home">Home</NuxtLink>
             <NuxtLink to="/deals">Best Deals</NuxtLink>
          </div>
       </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 80px;
  background: var(--secondary);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid var(--primary);
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -1px;
}

.nav {
  display: flex;
  gap: 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.nav a:hover { color: var(--primary); }

.search-bar {
  background: rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-bar input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  position: relative;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  flex: 1;
}

.footer {
  background: var(--secondary);
  color: white;
  padding: 4rem 0;
  margin-top: 4rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 4rem;
}

.footer-brand p {
  color: var(--text-muted);
  margin-top: 1rem;
  max-width: 300px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links h4 { font-size: 0.9rem; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--primary); }
.footer-links a { font-size: 0.9rem; color: var(--text-muted); }
.footer-links a:hover { color: white; }

@media (max-width: 800px) {
  .desktop-only { display: none; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
}
</style>

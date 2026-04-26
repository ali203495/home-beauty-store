<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()

const q = ref('')
const router = useRouter()

// Debounced search navigation
let timeout: any
watch(q, (newQ) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    if (newQ.trim().length > 2 || newQ.trim() === '') {
      router.push({ path: '/products', query: { q: newQ || undefined } })
    }
  }, 400)
})

const { data: settings } = await useFetch('/api/settings')

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/')
}
</script>

<template>
  <div v-if="settings?.shipping_restriction" class="top-announcement">
     <div class="container message-box">
        <span class="icon">🚛</span>
        {{ settings.shipping_restriction }}
     </div>
  </div>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo">
        EL-WALI<span>SHOP</span>
      </NuxtLink>

      <div class="search-bar">
        <input 
          type="text" 
          v-model="q" 
          placeholder="Search products, brands, categories..." 
        />
        <div class="search-icon-btn">🔍</div>
      </div>

      <nav class="nav-actions">
        <NuxtLink to="/products" class="nav-link">Shop All</NuxtLink>
        <NuxtLink to="/categories" class="nav-link">Categories</NuxtLink>
        <NuxtLink to="/cart" class="nav-link cart-link">
          <span class="icon">🛒</span>
          <span class="text">Cart</span>
        </NuxtLink>
        
        <div v-if="loggedIn" class="user-meta">
          <div class="user-greeting">
            <span class="hi">Hello,</span>
            <span class="user-name">{{ user?.name?.split(' ')[0] }}</span>
          </div>
          <NuxtLink v-if="user?.role === 'admin'" to="/admin" class="nav-link admin-link">Admin Panel</NuxtLink>
          <NuxtLink to="/account" class="nav-link">Account</NuxtLink>
          <button @click="logout" class="btn-logout">Logout</button>
        </div>
        <NuxtLink v-else to="/auth/login" class="btn btn-primary btn-sm">Login</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 10px -10px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.top-announcement {
  background: #0f172a;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.5rem 0;
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.message-box { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }


.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--secondary);
  text-decoration: none;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.logo span { color: var(--primary); }

.search-bar {
  flex: 1;
  max-width: 600px;
  position: relative;
  display: flex;
}

.search-bar input {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  outline: none;
}

.search-bar button {
  background: var(--primary);
  border: none;
  padding: 0 1.5rem;
  color: white;
  cursor: pointer;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #cbd5e1;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  color: white;
}

.icon { font-size: 1.2rem; }

.user-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-logout {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
}

.user-greeting { display: flex; flex-direction: column; line-height: 1; }
.user-greeting .hi { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.user-greeting .user-name { font-size: 0.9rem; font-weight: 800; color: #1e293b; }

.admin-link { 
  background: rgba(239, 68, 68, 0.1); 
  color: #ef4444; 
  padding: 0.4rem 0.8rem; 
  border-radius: 50px; 
  font-size: 0.75rem; 
  font-weight: 800;
  text-transform: uppercase;
}
.admin-link:hover { background: #ef4444; color: white; }

.btn-logout:hover { color: var(--primary); }

.btn-sm {
  padding: 0.5rem 1.2rem;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .search-bar { display: none; }
}
</style>

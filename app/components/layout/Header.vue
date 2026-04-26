<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()

const search = ref('')
const handleSearch = () => {
  if (search.value) {
    navigateTo(`/products?q=${search.value}`)
  }
}

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/')
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo">
        EL-WALI<span>SHOP</span>
      </NuxtLink>

      <div class="search-bar">
        <input 
          type="text" 
          v-model="search" 
          placeholder="Search products, brands and categories..." 
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">
          <span class="icon">🔍</span>
        </button>
      </div>

      <nav class="nav-actions">
        <NuxtLink to="/products" class="nav-link">Shop</NuxtLink>
        <NuxtLink to="/cart" class="nav-link cart-link">
          <span class="icon">🛒</span>
          <span class="text">Cart</span>
        </NuxtLink>
        
        <div v-if="loggedIn" class="user-meta">
          <NuxtLink to="/account" class="nav-link">Account</NuxtLink>
          <button @click="logout" class="btn-logout">Logout</button>
        </div>
        <NuxtLink v-else to="/auth/login" class="btn btn-primary btn-sm">Login</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  letter-spacing: -1px;
}

.logo span {
  color: var(--primary);
}

.search-bar {
  flex: 1;
  max-width: 600px;
  margin: 0 2rem;
  display: flex;
  background: white;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-bar input {
  flex: 1;
  border: none;
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

.btn-logout:hover { color: var(--primary); }

.btn-sm {
  padding: 0.5rem 1.2rem;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .search-bar { display: none; }
}
</style>

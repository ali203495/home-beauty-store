<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()

if (!loggedIn.value) {
   navigateTo('/auth/login')
}

const { data: views } = await useFetch('/api/tracking/recommended')

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/')
}
</script>

<template>
  <div class="account-page container section-padding fade-in-up">
    <div class="account-layout">
       <!-- Profile Sidebar -->
       <aside class="account-nav card">
          <div class="user-big-avatar">
             <div class="avatar-circle">{{ user?.name?.charAt(0) }}</div>
             <div class="user-details">
                <h3>{{ user?.name }}</h3>
                <p>{{ user?.email }}</p>
                <span class="role-badge" :class="user?.role">{{ user?.role }} account</span>
             </div>
          </div>
          <nav class="side-menu">
             <NuxtLink to="/account" class="menu-item active">Dashboard</NuxtLink>
             <NuxtLink to="/cart" class="menu-item">My Shopping Cart</NuxtLink>
             <NuxtLink to="/contact" class="menu-item">Get Support</NuxtLink>
             <button @click="logout" class="menu-item logout-btn">Logout</button>
          </nav>
       </aside>

       <!-- Main History/Settings -->
       <main class="account-content">
          <h1 class="title-md">Welcome back, {{ user?.name?.split(' ')[0] }}!</h1>
          <p class="subtitle">Manage your profile and explore items you might like.</p>

          <section class="mt-2 text-section">
             <h3>Your Shopping Activity</h3>
             <div v-if="views?.length" class="history-grid">
                <NuxtLink v-for="item in views" :key="item.id" :to="`/products/${item.slug}`" class="history-item card hover-lift">
                   <div class="item-img">
                      <img :src="JSON.parse(item.images || '[]')[0]" />
                   </div>
                   <div class="item-meta">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-price">${{ item.price }}</span>
                   </div>
                </NuxtLink>
             </div>
             <p v-else class="empty-state">No shopping history yet. Start browsing!</p>
          </section>

          <div class="info-banner card mt-2">
             <span class="icon">🎁</span>
             <div class="banner-text">
                <h3>Special Offer!</h3>
                <p>Because you're a member of EL-WALI SHOP, you get exclusive priority for deliveries in Marrakech.</p>
             </div>
          </div>
       </main>
    </div>
  </div>
</template>

<style scoped>
.account-layout { display: grid; grid-template-columns: 280px 1fr; gap: 3rem; align-items: start; }

.account-nav { padding: 2rem; position: sticky; top: 100px; }
.user-big-avatar { text-align: center; margin-bottom: 2.5rem; }
.avatar-circle { 
  width: 80px; height: 80px; background: var(--primary); color: white; font-size: 2.5rem; 
  font-weight: 900; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
  margin: 0 auto 1rem; box-shadow: 0 10px 20px -10px var(--primary);
}
.user-details h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem; }
.user-details p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem; }
.role-badge { 
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.6rem; 
  border-radius: 50px; background: #f1f5f9; color: #64748b; 
}
.role-badge.admin { background: #fee2e2; color: #ef4444; }

.side-menu { border-top: 1px solid var(--border); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
.menu-item { 
  padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-weight: 600; 
  color: var(--text-muted); text-decoration: none; transition: 0.2s; border: none; background: none; text-align: left; cursor: pointer;
}
.menu-item:hover, .menu-item.active { background: #f8fafc; color: var(--secondary); }
.logout-btn { color: #ef4444; margin-top: 1rem; }
.logout-btn:hover { background: #fef2f2; }

.subtitle { color: var(--text-muted); margin-top: 0.5rem; }
.mt-2 { margin-top: 3rem; }

.history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
.history-item { padding: 0.75rem; border: 1px solid var(--border); text-decoration: none; }
.item-img { aspect-ratio: 1; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-meta { display: flex; flex-direction: column; gap: 0.25rem; }
.item-name { font-weight: 700; font-size: 0.9rem; color: var(--secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-price { font-weight: 800; color: var(--primary); font-size: 1rem; }

.empty-state { padding: 3rem; text-align: center; background: #f8fafc; border-radius: var(--radius-sm); color: #94a3b8; font-style: italic; }

.info-banner { display: flex; gap: 1.5rem; align-items: center; padding: 2rem; border: none; background: #1e293b; color: white; }
.info-banner .icon { font-size: 3rem; }
.banner-text h3 { color: white; margin-bottom: 0.25rem; }
.banner-text p { color: #94a3b8; font-size: 0.95rem; }

@media (max-width: 868px) {
  .account-layout { grid-template-columns: 1fr; }
  .account-nav { position: static; }
}
</style>

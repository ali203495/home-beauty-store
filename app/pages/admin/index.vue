<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const { data: stats } = await useFetch('/api/admin/stats')
</script>

<template>
  <div class="admin-dashboard container section-padding">
    <div class="admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-nav card">
         <h2 class="title-md">Admin Panel</h2>
         <nav>
            <NuxtLink to="/admin" class="nav-item active">Dashboard</NuxtLink>
            <NuxtLink to="/admin/products" class="nav-item">Manage Products</NuxtLink>
            <NuxtLink to="/admin/categories" class="nav-item">Categories</NuxtLink>
            <NuxtLink to="/admin/orders" class="nav-item">Orders</NuxtLink>
            <NuxtLink to="/admin/users" class="nav-item">Customers</NuxtLink>
         </nav>
      </aside>

      <!-- Dashboard Stats -->
      <main class="admin-content">
         <h1 class="title-md">Dashboard Overview</h1>
         
         <div class="stats-grid">
            <div class="stat-card card">
               <span class="label">Total Sales</span>
               <span class="value">${{ stats?.totalSales || 0 }}</span>
            </div>
            <div class="stat-card card">
               <span class="label">Total Orders</span>
               <span class="value">{{ stats?.totalOrders || 0 }}</span>
            </div>
             <div class="stat-card card">
               <span class="label">Total Customers</span>
               <span class="value">{{ stats?.totalUsers || 0 }}</span>
            </div>
            <div class="stat-card card">
               <span class="label">Active Products</span>
               <span class="value">{{ stats?.totalProducts || 0 }}</span>
            </div>
         </div>

         <!-- Recent Orders Placeholder -->
         <div class="recent-orders card">
            <h3>Recent Orders</h3>
            <table class="admin-table">
               <thead>
                  <tr>
                     <th>ID</th>
                     <th>Customer</th>
                     <th>Total</th>
                     <th>Status</th>
                     <th>Date</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td colspan="5" class="empty">No recent orders yet.</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
}

.admin-nav nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.nav-item {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--text-muted);
}

.nav-item:hover, .nav-item.active {
  background: var(--primary);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card .label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
.stat-card .value { display: block; font-size: 2rem; font-weight: 800; margin-top: 0.5rem; }

.recent-orders { margin-top: 2rem; }

.admin-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.admin-table th { text-align: left; padding: 1rem; border-bottom: 2px solid var(--border); font-size: 0.8rem; text-transform: uppercase; }
.admin-table td { padding: 1rem; border-bottom: 1px solid var(--border); }
.empty { text-align: center; color: var(--text-muted); padding: 3rem !important; }
</style>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { data: orders, refresh } = await useFetch('/api/admin/orders')

const statusColors: any = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444'
}

const updateStatus = async (id: number, status: string) => {
   try {
      await $fetch(`/api/admin/orders/${id}`, {
         method: 'PATCH',
         body: { status }
      })
      await refresh()
   } catch (e) {
      alert('Failed to update status')
   }
}
</script>

<template>
  <div class="admin-orders container section-padding fade-in-up">
    <div class="admin-layout">
       <aside class="admin-nav card">
         <h2 class="title-md">Admin Panel</h2>
         <nav>
            <NuxtLink to="/admin" class="nav-item">Dashboard</NuxtLink>
            <NuxtLink to="/admin/orders" class="nav-item active">Orders</NuxtLink>
            <NuxtLink to="/admin/products" class="nav-item">Products</NuxtLink>
            <NuxtLink to="/admin/categories" class="nav-item">Categories</NuxtLink>
            <NuxtLink to="/admin/settings" class="nav-item">Site Settings</NuxtLink>
         </nav>
      </aside>

      <main class="admin-content">
         <h1 class="title-md">Sales & Orders</h1>
         <p class="text-muted">Manage your Marrakech warehouse fulfillment and local deliveries.</p>

         <div class="orders-list mt-2">
            <div v-if="!orders?.length" class="empty-state card">No orders found yet.</div>
            
            <div v-for="order in orders" :key="order.id" class="order-card card mb-1">
               <div class="order-header">
                  <div class="order-id">
                     <span class="label">ORDER #{{ order.id }}</span>
                     <span class="date">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
                  </div>
                  <div class="order-status-row">
                     <div v-if="order.whatsappClicked" class="whatsapp-badge" title="Customer clicked WhatsApp link">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" />
                        Clicked
                     </div>
                     <select 
                       :value="order.status" 
                       @change="(e: any) => updateStatus(order.id, e.target.value)"
                       :style="{ color: 'white', backgroundColor: statusColors[order.status] }"
                     >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                     </select>
                  </div>
               </div>

               <div class="order-body">
                  <div class="customer-info">
                     <strong>{{ order.customerName }}</strong>
                     <p>{{ order.customerPhone }}</p>
                     <p>{{ order.shippingAddress }}</p>
                  </div>

                  <div class="order-items">
                     <div v-for="item in order.items" :key="item.id" class="mini-item">
                        <span>{{ item.quantity }}x {{ item.product?.name }}</span>
                        <span>${{ item.priceAtTime }}</span>
                     </div>
                  </div>

                  <div class="order-total">
                     <span class="label">Total Paid</span>
                     <span class="amount">${{ order.totalAmount }}</span>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout { display: grid; grid-template-columns: 240px 1fr; gap: 2rem; }
.admin-nav nav { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem; }
.nav-item { padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-weight: 600; color: var(--text-muted); }
.nav-item:hover, .nav-item.active { background: var(--primary); color: white; }

.order-card { padding: 0; overflow: hidden; }
.order-header { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid var(--border);
}
.order-id { display: flex; flex-direction: column; }
.order-id .label { font-weight: 900; font-size: 0.9rem; color: var(--secondary); }
.order-id .date { font-size: 0.75rem; color: var(--text-muted); }

.order-status-row { display: flex; align-items: center; gap: 1rem; }
.whatsapp-badge { 
  display: flex; align-items: center; gap: 0.4rem; background: #dcfce7; color: #166534; 
  padding: 0.3rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800;
}
.whatsapp-badge img { width: 14px; height: 14px; }

.order-status-row select { 
  border: none; padding: 0.4rem 1rem; border-radius: 50px; 
  font-weight: 800; font-size: 0.75rem; cursor: pointer; outline: none; transition: 0.2s;
}

.order-body { padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr 180px; gap: 2rem; align-items: start; }
.customer-info strong { display: block; margin-bottom: 0.5rem; font-size: 1.1rem; }
.customer-info p { font-size: 0.9rem; color: var(--text-muted); margin: 0.1rem 0; }

.order-items { border-left: 1px solid var(--border); padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.mini-item { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; }

.order-total { text-align: right; }
.order-total .label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
.order-total .amount { font-size: 1.5rem; font-weight: 900; color: var(--primary); }

.empty-state { padding: 4rem; text-align: center; color: var(--text-muted); }
.mt-2 { margin-top: 2.5rem; }
.mb-1 { margin-bottom: 1.5rem; }

@media (max-width: 968px) {
  .order-body { grid-template-columns: 1fr; }
  .order-items { border-left: none; padding-left: 0; border-top: 1px solid var(--border); padding-top: 1.5rem; }
}
</style>

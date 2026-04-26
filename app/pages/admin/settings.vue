<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { data: settings, refresh } = await useFetch('/api/settings')

const fields = ref([
   { key: 'site_name', label: 'Store Name', placeholder: 'EL-WALI SHOP' },
   { key: 'contact_email', label: 'Support Email', placeholder: 'contact@el-wali.com' },
   { key: 'contact_phone', label: 'Phone Number', placeholder: '+212 6XX-XXXXXX' },
   { key: 'contact_address', label: 'Physical Address', placeholder: 'Sidi Youssef Ben Ali, Marrakech' },
   { key: 'shipping_restriction', label: 'Shipping Notice', placeholder: '🚚 Exclusive Shipping in Marrakech Only!' },
   { key: 'work_hours', label: 'Working Hours', placeholder: 'Mon-Sat: 09:00 - 20:00' }
])

const loading = ref(false)

const saveSetting = async (key: string, value: string) => {
   loading.value = true
   try {
      await $fetch('/api/settings', { method: 'POST', body: { key, value } })
   } catch (e) {
      alert('Failed to save ' + key)
   } finally {
      loading.value = false
   }
}
</script>

<template>
  <div class="admin-settings container section-padding fade-in-up">
    <div class="admin-layout">
      <aside class="admin-nav card">
         <h2 class="title-md">Admin Panel</h2>
         <nav>
            <NuxtLink to="/admin" class="nav-item">Dashboard</NuxtLink>
            <NuxtLink to="/admin/products" class="nav-item">Manage Products</NuxtLink>
            <NuxtLink to="/admin/categories" class="nav-item">Categories</NuxtLink>
            <NuxtLink to="/admin/brands" class="nav-item">Brands</NuxtLink>
            <NuxtLink to="/admin/settings" class="nav-item active">Site Settings</NuxtLink>
         </nav>
      </aside>

      <main class="admin-content">
         <h1 class="title-md">Global Site Configuration</h1>
         <p class="text-muted">Manage the information displayed on the Contact page and Header notices.</p>

         <div class="card settings-card mt-2">
            <div v-for="field in fields" :key="field.key" class="setting-item">
               <div class="setting-info">
                  <label>{{ field.label }}</label>
                  <input 
                    type="text" 
                    :value="settings?.[field.key]" 
                    @change="(e: any) => saveSetting(field.key, e.target.value)"
                    :placeholder="field.placeholder"
                  />
               </div>
               <div class="status-indicator" :class="{ saved: true }">✔</div>
            </div>
         </div>

         <div class="card mt-2 notice-preview">
            <h3>Shipping Restriction Preview</h3>
            <div class="marrakech-badge">
               {{ settings?.shipping_restriction || 'No notice configured' }}
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

.settings-card { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
.setting-item { display: flex; align-items: flex-end; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
.setting-info { flex: 1; }
.setting-info label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--secondary); }
.setting-info input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; transition: 0.2s; }
.setting-info input:focus { border-color: var(--primary); }

.status-indicator { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #10b981; opacity: 0.4; }

.marrakech-badge { background: #fee2e2; color: #ef4444; padding: 1rem; border-radius: var(--radius-sm); font-weight: 800; text-align: center; border: 2px dashed #f87171; }
.mt-2 { margin-top: 2rem; }
</style>

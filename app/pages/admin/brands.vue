<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { data: brands, refresh } = await useFetch('/api/admin/brands')

const form = ref({ name: '', slug: '', logo: '', description: '', website: '' })
const editingId = ref<number | null>(null)
const loading = ref(false)

const saveBrand = async () => {
  loading.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/brands/${editingId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/admin/brands', { method: 'POST', body: form.value })
    }
    resetForm()
    await refresh()
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Action failed')
  } finally {
    loading.value = false
  }
}

const editBrand = (item: any) => {
  editingId.value = item.id
  form.value = { ...item }
}

const deleteBrand = async (id: number) => {
  if (!confirm('Are you sure?')) return
  await $fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
  await refresh()
}

const resetForm = () => {
  editingId.value = null
  form.value = { name: '', slug: '', logo: '', description: '', website: '' }
}
</script>

<template>
  <div class="admin-brands container section-padding">
    <div class="admin-layout">
      <aside class="admin-nav card">
         <h2 class="title-md">Admin Panel</h2>
         <nav>
            <NuxtLink to="/admin" class="nav-item">Dashboard</NuxtLink>
            <NuxtLink to="/admin/products" class="nav-item">Manage Products</NuxtLink>
            <NuxtLink to="/admin/categories" class="nav-item">Categories</NuxtLink>
            <NuxtLink to="/admin/brands" class="nav-item active">Brands</NuxtLink>
         </nav>
      </aside>

      <main class="admin-content">
        <h1 class="title-md">Manage Brands</h1>

        <div class="card form-card">
          <h3>{{ editingId ? 'Edit Brand' : 'Register New Brand' }}</h3>
          <form @submit.prevent="saveBrand" class="admin-form">
            <div class="form-row">
              <div class="input-group">
                <label>Brand Name</label>
                <input v-model="form.name" required placeholder="e.g. Samsung" />
              </div>
              <div class="input-group">
                <label>Slug</label>
                <input v-model="form.slug" required placeholder="samsung" />
              </div>
            </div>
            
            <div class="input-group">
              <label>Logo URL</label>
              <input v-model="form.logo" placeholder="https://..." />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Saving...' : (editingId ? 'Update' : 'Create') }}
              </button>
              <button v-if="editingId" type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card table-card">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Brand Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="brand in brands" :key="brand.id">
                <td>{{ brand.id }}</td>
                <td>{{ brand.name }}</td>
                <td>{{ brand.slug }}</td>
                <td class="table-actions">
                  <button @click="editBrand(brand)" class="btn-icon">✎</button>
                  <button @click="deleteBrand(brand.id)" class="btn-icon delete">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
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

.form-card { margin-bottom: 2rem; }
.admin-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.input-group label { display: block; font-size: 0.8rem; margin-bottom: 0.4rem; font-weight: 700; }
.input-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; }
.form-actions { display: flex; gap: 1rem; margin-top: 1rem; }

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { text-align: left; padding: 1rem; border-bottom: 2px solid var(--border); }
.admin-table td { padding: 1rem; border-bottom: 1px solid var(--border); }
.btn-icon { background: none; border: 1px solid var(--border); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { border-color: var(--primary); color: var(--primary); }
.btn-icon.delete:hover { border-color: #ef4444; color: #ef4444; }
.table-actions { display: flex; gap: 0.5rem; }
</style>

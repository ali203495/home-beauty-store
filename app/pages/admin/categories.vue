<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { data: categories, refresh } = await useFetch('/api/admin/categories')

const form = ref({ name: '', slug: '', image: '', description: '', sortOrder: 0 })
const editingId = ref<number | null>(null)
const loading = ref(false)

const saveCategory = async () => {
  loading.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/categories/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: form.value
      })
    }
    resetForm()
    await refresh()
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Action failed')
  } finally {
    loading.value = false
  }
}

const editCategory = (cat: any) => {
  editingId.value = cat.id
  form.value = { ...cat }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Are you sure?')) return
  await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  await refresh()
}

const resetForm = () => {
  editingId.value = null
  form.value = { name: '', slug: '', image: '', description: '', sortOrder: 0 }
}
</script>

<template>
  <div class="admin-categories container section-padding">
    <div class="admin-layout">
      <!-- Sidebar placeholder or use a shared component if possible -->
      <aside class="admin-nav card">
         <h2 class="title-md">Admin Panel</h2>
         <nav>
            <NuxtLink to="/admin" class="nav-item">Dashboard</NuxtLink>
            <NuxtLink to="/admin/products" class="nav-item">Manage Products</NuxtLink>
            <NuxtLink to="/admin/categories" class="nav-item active">Categories</NuxtLink>
            <NuxtLink to="/admin/brands" class="nav-item">Brands</NuxtLink>
         </nav>
      </aside>

      <main class="admin-content">
        <h1 class="title-md">Manage Categories</h1>

        <!-- Form Card -->
        <div class="card form-card">
          <h3>{{ editingId ? 'Edit Category' : 'Create New Category' }}</h3>
          <form @submit.prevent="saveCategory" class="admin-form">
            <div class="form-row">
              <div class="input-group">
                <label>Name</label>
                <input v-model="form.name" required placeholder="e.g. Électroménager" />
              </div>
              <div class="input-group">
                <label>Slug</label>
                <input v-model="form.slug" required placeholder="electro-menager" />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label>Parent Category (Optional)</label>
                <select v-model="form.parentId">
                  <option :value="null">None (Main Category)</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id" v-show="c.id !== editingId">
                    {{ c.name }}
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>Sort Order</label>
                <input type="number" v-model="form.sortOrder" />
              </div>
            </div>
            
            <div class="input-group">
              <label>Image URL</label>
              <input v-model="form.image" placeholder="https://..." />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Saving...' : (editingId ? 'Update' : 'Create') }}
              </button>
              <button v-if="editingId" type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Table Card -->
        <div class="card table-card">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td>{{ cat.name }}</td>
                <td>{{ cat.slug }}</td>
                <td class="table-actions">
                  <button @click="editCategory(cat)" class="btn-icon">✎</button>
                  <button @click="deleteCategory(cat.id)" class="btn-icon delete">🗑</button>
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

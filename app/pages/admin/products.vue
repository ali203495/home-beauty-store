<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { data: products, refresh } = await useFetch('/api/admin/products')
const { data: categories } = await useFetch('/api/admin/categories')
const { data: brands } = await useFetch('/api/admin/brands')

const form = ref({
  name: '', slug: '', description: '', price: 0, salePrice: null, costPrice: null,
  stock: 0, images: '', categoryId: null, brandId: null, isFeatured: false, isActive: true
})
const editingId = ref<number | null>(null)
const loading = ref(false)

const saveProduct = async () => {
  loading.value = true
  try {
    const payload = { ...form.value }
    if (editingId.value) {
      await $fetch(`/api/admin/products/${editingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/admin/products', { method: 'POST', body: payload })
    }
    resetForm()
    await refresh()
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Action failed')
  } finally {
    loading.value = false
  }
}

const editProduct = (p: any) => {
  editingId.value = p.id
  form.value = { ...p }
  // Handle empty images field if it's stored as JSON string
  if (typeof form.value.images === 'string' && form.value.images) {
     // keep it as string for now for the input field
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('Delete this product?')) return
  await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
  await refresh()
}

const resetForm = () => {
  editingId.value = null
  form.value = {
    name: '', slug: '', description: '', price: 0, salePrice: null, 
    stock: 0, images: '', categoryId: null, brandId: null, isFeatured: false, isActive: true
  }
}

const handleFileUpload = async (e: any) => {
  const file = e.target.files[0]
  if (!file) return
  
  // Accept up to 15MB raw input
  if (file.size > 15 * 1024 * 1024) {
    alert('Error: Original image is too large. Max limit is 15MB.')
    e.target.value = ''
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('Error: Only images are allowed.')
    e.target.value = ''
    return
  }

  loading.value = true
  try {
    const optimizedBase64 = await compressToWebP(file)
    form.value.images = JSON.stringify([optimizedBase64])
  } catch (err) {
    alert('Failed to process image')
  } finally {
    loading.value = false
  }
}

// Enterprise Image Optimizer (Canvas API)
const compressToWebP = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Downscale if image is massive (e.g. > 1600px) to keep base64 string light
        const MAX_WIDTH = 1600
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Export to WebP at 0.8 quality (Best balance)
        const dataUrl = canvas.toDataURL('image/webp', 0.8)
        resolve(dataUrl)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}


</script>


<template>
  <div class="admin-products container section-padding">
    <div class="admin-layout">
      <aside class="admin-nav card">
         <h2 class="title-md">Admin Panel</h2>
         <nav>
            <NuxtLink to="/admin" class="nav-item">Dashboard</NuxtLink>
            <NuxtLink to="/admin/products" class="nav-item active">Manage Products</NuxtLink>
            <NuxtLink to="/admin/categories" class="nav-item">Categories</NuxtLink>
            <NuxtLink to="/admin/brands" class="nav-item">Brands</NuxtLink>
         </nav>
      </aside>

      <main class="admin-content">
        <h1 class="title-md">Manage Products</h1>

        <div class="card form-card">
          <h3>{{ editingId ? 'Edit Product' : 'Add New Product' }}</h3>
          <form @submit.prevent="saveProduct" class="admin-form">
            <div class="form-row">
              <div class="input-group">
                <label>Product Name</label>
                <input v-model="form.name" required placeholder="e.g. Fridge S-400" />
              </div>
              <div class="input-group">
                <label>Slug</label>
                <input v-model="form.slug" required placeholder="fridge-s-400" />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" v-model="form.price" required />
              </div>
              <div class="input-group">
                <label>Sale Price (Optional)</label>
                <input type="number" step="0.01" v-model="form.salePrice" />
              </div>
              <div class="input-group">
                <label>Cost Price (Safety)</label>
                <input type="number" step="0.01" v-model="form.costPrice" placeholder="Buy price" />
              </div>
              <div class="input-group">
                <label>Stock Quantity</label>
                <input type="number" v-model="form.stock" required />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label>Category</label>
                <select v-model="form.categoryId" required>
                  <option :value="null">Select Category</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="input-group">
                <label>Brand</label>
                <select v-model="form.brandId" required>
                  <option :value="null">Select Brand</option>
                  <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>
            </div>

            <div class="input-group">
              <label>Product Images</label>
              <div class="upload-wrapper">
                 <input type="file" @change="handleFileUpload" accept="image/*" />
                 <input v-model="form.images" placeholder='Or paste ["https://..."]' />
              </div>
              <div v-if="form.images" class="image-preview-admin">
                 <img :src="form.images.startsWith('[') ? JSON.parse(form.images)[0] : form.images" />
              </div>
            </div>

            <div class="input-group">
              <label>Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Product details..."></textarea>
            </div>

            <div class="form-row-checks">
               <label class="check-item"><input type="checkbox" v-model="form.isFeatured" /> Featured Product</label>
               <label class="check-item"><input type="checkbox" v-model="form.isActive" /> Active (Visible to clients)</label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Saving...' : (editingId ? 'Update' : 'Add Product') }}
              </button>
              <button v-if="editingId" type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card table-card overflow-x">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id">
                <td>{{ p.id }}</td>
                <td>
                   <div class="table-product">
                      <strong>{{ p.name }}</strong>
                      <span class="small">{{ p.brand?.name }}</span>
                   </div>
                </td>
                <td>${{ p.price }}</td>
                <td>{{ p.stock }}</td>
                <td>{{ p.category?.name }}</td>
                <td class="table-actions">
                   <button @click="editProduct(p)" class="btn-icon">✎</button>
                   <button @click="deleteProduct(p.id)" class="btn-icon delete">🗑</button>
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
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.input-group label { display: block; font-size: 0.8rem; margin-bottom: 0.4rem; font-weight: 700; }
.input-group input, .input-group select, .input-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; }
.form-row-checks { display: flex; gap: 2rem; margin: 0.5rem 0; }
.check-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; }

.upload-wrapper { display: flex; flex-direction: column; gap: 0.5rem; }
.image-preview-admin { margin-top: 1rem; width: 100px; height: 100px; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid var(--primary); }
.image-preview-admin img { width: 100%; height: 100%; object-fit: cover; }

.form-actions { display: flex; gap: 1rem; margin-top: 1rem; }


.overflow-x { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.admin-table th { text-align: left; padding: 1rem; border-bottom: 2px solid var(--border); }
.admin-table td { padding: 1rem; border-bottom: 1px solid var(--border); }

.table-product { display: flex; flex-direction: column; }
.small { font-size: 0.75rem; color: var(--text-muted); }

.btn-icon { background: none; border: 1px solid var(--border); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { border-color: var(--primary); color: var(--primary); }
.btn-icon.delete:hover { border-color: #ef4444; color: #ef4444; }
.table-actions { display: flex; gap: 0.5rem; }
</style>

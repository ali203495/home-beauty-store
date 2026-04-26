<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Fetch root categories for the sidebar
const { data: rootCategories } = await useFetch('/api/categories?rootOnly=true')
const { data: brands } = await useFetch('/api/brands')

// Reactive Filters
const q = ref(route.query.q || '')
const selectedCategory = ref(route.query.category || '')
const selectedBrand = ref(route.query.brand || '')

// Fetch products based on filters
const { data: products, refresh, status } = await useFetch('/api/products', {
  query: computed(() => ({
    search: q.value,
    category: selectedCategory.value,
    brand: selectedBrand.value
  }))
})

// Update URL on filter change
watch([q, selectedCategory, selectedBrand], () => {
  router.push({
    query: {
      q: q.value || undefined,
      category: selectedCategory.value || undefined,
      brand: selectedBrand.value || undefined
    }
  })
}, { deep: true })

// Sync with incoming URL changes (e.g. from Header)
watch(() => route.query.q, (newQ) => {
  q.value = newQ || ''
})

const clearFilters = () => {
  q.value = ''
  selectedCategory.value = ''
  selectedBrand.value = ''
}

// Sub-category logic: fetch sub-categories of the selected category if any
const { data: subCategories } = await useFetch(() => `/api/categories?parentId=${selectedCategory.value}`, {
   immediate: true,
   watch: [selectedCategory]
})
</script>

<template>
  <div class="products-page container section-padding">
    <div class="layout-sidebar">
      <!-- Sidebar Filters -->
      <aside class="filters-sidebar">
        <h2 class="title-sm">Filters</h2>

        <div class="filter-group">
          <label>Search Products</label>
          <div class="search-input-wrapper">
            <input type="text" v-model="q" placeholder="Type name, brand..." />
            <span class="search-icon">🔍</span>
          </div>
        </div>

        <div class="filter-group">
          <label>Categories</label>
          <div class="filter-list scroll-list">
             <button 
               class="filter-link" 
               :class="{active: !selectedCategory}"
               @click="selectedCategory = ''"
             >
               All Departments
             </button>
             <div v-for="cat in rootCategories" :key="cat.id">
                <button 
                  class="filter-link" 
                  :class="{active: selectedCategory == cat.id}"
                  @click="selectedCategory = cat.id"
                >
                  {{ cat.name }}
                </button>
             </div>
          </div>
        </div>

        <div class="filter-group" v-if="brands?.length">
          <label>Top Brands</label>
          <div class="filter-list scroll-list">
             <button 
               class="filter-link" 
               :class="{active: !selectedBrand}"
               @click="selectedBrand = ''"
             >
               All Brands
             </button>
             <button 
               v-for="brand in brands" 
               :key="brand.id"
               class="filter-link"
               :class="{active: selectedBrand == brand.id}"
               @click="selectedBrand = brand.id"
             >
               {{ brand.name }}
             </button>
          </div>
        </div>

        <button @click="clearFilters" class="btn btn-secondary w-full">Reset Filters</button>
      </aside>

      <!-- Main Content -->
      <main class="products-content">
        <div class="results-bar card">
           <div class="results-info">
              <h1 class="title-sm">
                {{ selectedCategory ? 'Category Results' : 'Explore All' }}
              </h1>
              <span class="text-muted">{{ products?.length || 0 }} products found</span>
           </div>
           
           <div class="results-actions">
              <select class="sort-select">
                 <option>Best Match</option>
                 <option>Newest First</option>
                 <option>Price: Low-High</option>
              </select>
           </div>
        </div>

        <div v-if="status === 'pending'" class="loading-grid">
           <div v-for="i in 8" :key="i" class="skeleton-card"></div>
        </div>

        <div v-else-if="products?.length" class="catalog-grid">
           <div v-for="product in products" :key="product.id" class="product-card card hover-lift">
              <NuxtLink :to="`/products/${product.slug}`" class="product-img">
                 <img :src="JSON.parse(product.images || '[]')[0]" :alt="product.name">
              </NuxtLink>
              <div class="product-info">
                 <span class="product-brand">{{ product.brand?.name }}</span>
                 <NuxtLink :to="`/products/${product.slug}`" class="product-name">{{ product.name }}</NuxtLink>
                 <div class="price-row">
                    <div class="prices">
                       <span v-if="product.salePrice" class="sale-price">${{ product.salePrice }}</span>
                       <span :class="{'old-price': product.salePrice}">${{ product.price }}</span>
                    </div>
                    <button class="btn-add-cart">+</button>
                 </div>
              </div>
           </div>
        </div>
        
        <div v-else class="empty-state card">
           <div class="empty-icon">📂</div>
           <h2>No matching products</h2>
           <p>Try adjusting your search or category filters.</p>
           <button @click="clearFilters" class="btn btn-primary">Show everything</button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-sidebar {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2.5rem;
}

.filters-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.filter-group {
  margin-bottom: 2.5rem;
}

.filter-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper input {
  width: 100%;
  padding: 0.85rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
  transition: all 0.2s;
}

.search-input-wrapper input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 49, 0, 0.1);
}

.search-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.4; }

.filter-list {
  display: flex;
  flex-direction: column;
}

.scroll-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.filter-link {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.75rem;
  background: none;
  border: none;
  border-left: 2px solid transparent;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.filter-link:hover {
  background: #f8fafc;
  color: var(--primary);
}

.filter-link.active {
  background: rgba(230, 49, 0, 0.05);
  color: var(--primary);
  font-weight: 700;
  border-left-color: var(--primary);
}

.results-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  margin-bottom: 2rem;
  border: none;
  box-shadow: var(--shadow-sm);
}

.results-info h1 { margin: 0; }
.results-info span { font-size: 0.85rem; }

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
  outline: none;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
.hover-lift:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }

.product-card { padding: 0; overflow: hidden; }
.product-img { width: 100%; aspect-ratio: 1; overflow: hidden; display: block; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 1.25rem; }
.product-brand { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem; }
.product-name { font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; display: block; height: 2.8rem; overflow: hidden; color: var(--secondary); line-height: 1.4; }
.price-row { display: flex; justify-content: space-between; align-items: center; }
.prices { display: flex; gap: 0.5rem; align-items: baseline; }
.sale-price { color: var(--primary); font-weight: 800; font-size: 1.2rem; }
.old-price { text-decoration: line-through; color: var(--text-muted); font-size: 0.9rem; }
.btn-add-cart { background: var(--secondary); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; }

.empty-state { text-align: center; padding: 5rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state h2 { margin-bottom: 0.5rem; }
.empty-state p { color: var(--text-muted); margin-bottom: 2rem; }

.w-full { width: 100%; }

@media (max-width: 968px) {
  .layout-sidebar { grid-template-columns: 1fr; }
  .filters-sidebar { display: none; }
}
</style>

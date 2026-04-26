<script setup lang="ts">
const route = useRoute()
const { data: categories } = await useFetch('/api/categories')
const { data: brands } = await useFetch('/api/brands')

// Reactive Filters
const q = ref(route.query.q || '')
const selectedCategory = ref(route.query.category || '')
const selectedBrand = ref(route.query.brand || '')

const { data: products, refresh } = await useFetch('/api/products', {
  query: computed(() => ({
    q: q.value,
    category: selectedCategory.value,
    brand: selectedBrand.value
  }))
})

// Watch query changes from URL (e.g. from header search)
watch(() => route.query.q, (newQ) => {
  q.value = newQ || ''
})

const clearFilters = () => {
  q.value = ''
  selectedCategory.value = ''
  selectedBrand.value = ''
}
</script>

<template>
  <div class="products-page container section-padding">
    <div class="layout-sidebar">
      <!-- Sidebar Filters -->
      <aside class="filters-sidebar">
        <div class="filter-group">
          <h3>Search</h3>
          <div class="filter-search">
            <input type="text" v-model="q" placeholder="Keywords..." />
          </div>
        </div>

        <div class="filter-group">
          <h3>Categories</h3>
          <div class="filter-list">
            <label class="filter-item">
              <input type="radio" value="" v-model="selectedCategory" /> All Categories
            </label>
            <label v-for="cat in categories" :key="cat.id" class="filter-item">
              <input type="radio" :value="cat.slug" v-model="selectedCategory" /> {{ cat.name }}
            </label>
          </div>
        </div>

        <div class="filter-group">
          <h3>Brands</h3>
          <div class="filter-list">
             <label class="filter-item">
              <input type="radio" value="" v-model="selectedBrand" /> All Brands
            </label>
            <label v-for="brand in brands" :key="brand.id" class="filter-item">
              <input type="radio" :value="brand.slug" v-model="selectedBrand" /> {{ brand.name }}
            </label>
          </div>
        </div>

        <button @click="clearFilters" class="btn-clear">Clear Filters</button>
      </aside>

      <!-- Main Content -->
      <main class="products-content">
        <div class="results-header">
           <h1 class="title-md">All Products ({{ products?.length || 0 }})</h1>
           <div class="sort-selector">
              <span>Sort by: </span>
              <select>
                 <option>Latest</option>
                 <option>Price: Low to High</option>
                 <option>Price: High to Low</option>
              </select>
           </div>
        </div>

        <div v-if="products?.length" class="catalog-grid">
           <div v-for="product in products" :key="product.id" class="product-card card">
             <div class="product-img">
                <img :src="JSON.parse(product.images)[0]" :alt="product.name">
             </div>
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
        <div v-else class="empty-state">
           <p>No products match your filters.</p>
           <button @click="clearFilters" class="btn btn-primary">Reset All</button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-sidebar {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 3rem;
}

.filters-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.filter-group {
  margin-bottom: 2rem;
}

.filter-group h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.filter-search input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-item {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn-clear {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--primary);
  color: var(--primary);
  font-weight: 700;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius);
  border-bottom: 1px solid var(--border);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

/* Same product card styles as homepage (should be a component) */
.product-card { padding: 0; overflow: hidden; }
.product-img { width: 100%; aspect-ratio: 1; overflow: hidden; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 1rem; }
.product-brand { display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem; }
.product-name { font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; display: block; height: 2.4rem; overflow: hidden; }
.price-row { display: flex; justify-content: space-between; align-items: center; }
.prices { display: flex; gap: 0.5rem; align-items: baseline; }
.sale-price { color: var(--primary); font-weight: 800; font-size: 1.1rem; }
.old-price { text-decoration: line-through; color: var(--text-muted); font-size: 0.8rem; }
.btn-add-cart { background: var(--secondary); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; }

.empty-state { text-align: center; padding: 4rem; }

@media (max-width: 768px) {
  .layout-sidebar { grid-template-columns: 1fr; }
  .filters-sidebar { display: none; }
}
</style>

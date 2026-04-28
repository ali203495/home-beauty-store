<script setup lang="ts">
const route = useRoute()
const searchInput = ref((route.query.q as string) || '')
const results = ref<any[]>([])
const loading = ref(false)

// Debounced Search Logic
const performSearch = async (val: string) => {
  if (!val.trim()) {
    results.value = []
    return
  }
  
  loading.value = true
  try {
    const data = await $fetch('/api/products', {
      params: { search: val }
    })
    results.value = data.items
  } catch (e) {
    console.error('Search failed', e)
  } finally {
    loading.value = false
  }
}

// Watch for input changes with debounce
watch(searchInput, (newVal) => {
  const handler = setTimeout(() => {
    performSearch(newVal)
  }, 300)
  return () => clearTimeout(handler)
}, { immediate: true })

useSeoMeta({
  title: `Search: ${searchInput.value} | EL-WALI SHOP`,
  description: `Find the best products for ${searchInput.value} in Marrakech.`
})
</script>

<template>
  <div class="search-page container section-padding fade-in-up">
    <div class="search-header">
       <h1 class="title-lg">Search Catalog</h1>
       <div class="search-input-wrapper card">
          <span class="icon">🔍</span>
          <input 
            v-model="searchInput" 
            type="text" 
            placeholder="Search for products, brands, or categories..."
            class="search-input"
            autofocus
          />
       </div>
    </div>

    <div v-if="loading" class="results-grid">
       <div v-for="i in 8" :key="i" class="skeleton-card card"></div>
    </div>

    <div v-else-if="results.length > 0" class="results-grid">
       <ProductCard v-for="product in results" :key="product.id" :product="product" />
    </div>

    <div v-else-if="searchInput" class="empty-state">
       <div class="empty-icon">📂</div>
       <h3>No results for "{{ searchInput }}"</h3>
       <p>Try checking your spelling or using more general terms.</p>
       <NuxtLink to="/" class="btn-primary inline-block">Browse All Products</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.search-header {
  max-width: 800px;
  margin: 0 auto 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-full);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.25rem;
  color: var(--text-dark);
  font-weight: 600;
  outline: none;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon { font-size: 4rem; }

.skeleton-card { aspect-ratio: 0.8; }
</style>

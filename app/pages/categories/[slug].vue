<script setup lang="ts">
const route = useRoute()
const { data: category } = await useFetch(`/api/categories/${route.params.slug}`)

// 1. Filter State (URL Synced)
const filters = ref({
  sort: 'newest',
  priceRange: [0, 2000],
  brand: 'all'
})

// 2. Data Fetching with Reactive Filters
const { data: products, pending } = await useFetch('/api/products', {
  query: computed(() => ({
    category: category.value?.id,
    sort: filters.value.sort,
    minPrice: filters.value.priceRange[0],
    maxPrice: filters.value.priceRange[1],
    limit: 12
  })),
  watch: [filters] // Re-fetch on filter change
})
</script>

<template>
  <div class="bg-white min-h-screen pt-32 pb-24">
    <div class="container-sm">
      <!-- Header -->
      <div class="text-center mb-16 space-y-4 animate-luxury-fade">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-gold">Collection Exclusive</span>
        <h1 class="text-5xl md:text-7xl font-display">{{ category?.name }}</h1>
        <p class="text-luxury-muted max-w-xl mx-auto font-light text-sm">{{ category?.description }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Sidebar Filters (Desktop) -->
        <aside class="hidden lg:block lg:col-span-3 space-y-10 border-r border-luxury-border pr-12">
          <div>
            <h3 class="text-[10px] font-black uppercase tracking-widest mb-6">Trier Par</h3>
            <select v-model="filters.sort" class="input-luxury">
              <option value="newest">Nouveautés</option>
              <option value="price_asc">Prix: Croissant</option>
              <option value="price_desc">Prix: Décroissant</option>
              <option value="trending">Tendances</option>
            </select>
          </div>

          <div>
            <h3 class="text-[10px] font-black uppercase tracking-widest mb-6">Gamme de Prix</h3>
            <div class="space-y-4">
              <input type="range" min="0" max="2000" step="50" v-model="filters.priceRange[1]" class="w-full accent-luxury-gold" />
              <div class="flex justify-between text-[10px] font-bold uppercase text-luxury-muted">
                <span>0 MAD</span>
                <span>{{ filters.priceRange[1] }} MAD</span>
              </div>
            </div>
          </div>

          <div class="pt-10">
            <TrustBadge />
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="lg:col-span-9">
          <!-- Mobile Filter Trigger -->
          <div class="lg:hidden flex justify-between items-center mb-8 border-b border-luxury-border pb-4">
            <span class="text-[10px] font-bold uppercase tracking-widest">{{ products?.length || 0 }} Articles</span>
            <button class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <span class="i-heroicons-adjustments-horizontal" />
              Filtrer
            </button>
          </div>

          <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 opacity-50">
            <div v-for="i in 6" :key="i" class="aspect-[4/5] bg-luxury-cream animate-pulse" />
          </div>
          
          <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <ProductCard v-for="prod in products" :key="prod.id" :product="prod" />
          </div>

          <div v-if="!pending && products?.length === 0" class="py-24 text-center space-y-4">
            <p class="text-luxury-muted uppercase text-xs tracking-widest font-light">Aucun produit ne correspond à vos filtres</p>
            <button @click="filters.priceRange = [0, 2000]" class="text-luxury-gold underline text-[10px] uppercase font-bold">Réinitialiser</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

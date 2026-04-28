<script setup lang="ts">
const isOpen = ref(false)
const query = ref('')
const results = ref([])
const loading = ref(false)

// 1. Instant Search with Debounce
watch(query, async (newQuery) => {
  if (newQuery.length < 2) {
    results.value = []
    return
  }
  
  loading.value = true
  try {
    const data = await $fetch('/api/products', {
      query: { search: newQuery, limit: 6 }
    })
    results.value = data.items
  } catch (e) {
    console.error('Search failed:', e)
  } finally {
    loading.value = false
  }
})

const close = () => {
  isOpen.value = false
  query.value = ''
}

defineExpose({ open: () => isOpen.value = true })
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[3000] bg-white/95 backdrop-blur-xl flex flex-col p-6 md:p-12">
        <!-- Close -->
        <button @click="close" class="absolute top-6 right-6 text-3xl text-luxury-black">
          <span class="i-heroicons-x-mark" />
        </button>

        <!-- Search Input -->
        <div class="max-w-4xl mx-auto w-full pt-12 md:pt-24">
          <div class="relative">
            <span class="absolute left-0 top-1/2 -translate-y-1/2 i-heroicons-magnifying-glass text-3xl text-luxury-gold" />
            <input 
              v-model="query"
              type="text" 
              placeholder="Rechercher un produit, une marque..." 
              class="w-full bg-transparent border-b-2 border-luxury-border py-4 pl-12 text-2xl md:text-5xl font-display outline-none focus:border-luxury-gold transition-all"
              autofocus
            />
          </div>

          <!-- Results -->
          <div class="mt-16">
            <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 gap-8 opacity-50">
               <div v-for="i in 3" :key="i" class="h-32 bg-luxury-cream animate-pulse" />
            </div>

            <div v-else-if="results.length > 0" class="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 animate-luxury-fade">
               <NuxtLink 
                 v-for="product in results" 
                 :key="product.id" 
                 :to="`/products/${product.slug}`"
                 @click="close"
                 class="flex gap-4 group"
               >
                 <div class="w-20 h-24 bg-luxury-cream overflow-hidden flex-shrink-0">
                    <img :src="JSON.parse(product.images || '[]')[0]" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                 </div>
                 <div class="flex flex-col justify-center">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-luxury-black group-hover:text-luxury-gold">{{ product.name }}</h3>
                    <p class="text-xs font-bold mt-2">{{ product.price }} MAD</p>
                 </div>
               </NuxtLink>
            </div>

            <div v-else-if="query.length > 2" class="text-center py-24">
               <p class="text-luxury-muted uppercase text-xs tracking-[0.5em]">Aucun résultat pour "{{ query }}"</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

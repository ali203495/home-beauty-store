<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const sortBy = ref('featured')

// 1. Fetch products for this category
const { data: categoryData } = await useAsyncData(`category-${slug}`, () => 
  $fetch(`/api/categories/${slug}`)
)

const sortedProducts = computed(() => {
  if (!categoryData.value?.products) return []
  const items = [...categoryData.value.products]
  
  if (sortBy.value === 'price-asc') return items.sort((a, b) => Number(a.price) - Number(b.price))
  if (sortBy.value === 'price-desc') return items.sort((a, b) => Number(b.price) - Number(a.price))
  return items // default 'featured'
})

useHead({
  title: `${categoryData.value?.category?.name || 'Category'} | El Wali Beauty`,
  meta: [
    { name: 'description', content: `Découvrez notre collection exclusive de ${categoryData.value?.category?.name}. Produits de luxe, authentique et livraison express.` }
  ]
})
</script>

<template>
  <div v-if="categoryData" class="bg-white min-h-screen">
    <!-- Editorial Hero -->
    <section class="relative h-[60vh] flex items-center justify-center overflow-hidden bg-luxury-black">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-black/40 z-10" />
        <img 
          :src="categoryData.category.image || '/img/cat-placeholder.jpg'" 
          class="w-full h-full object-cover scale-105"
        />
      </div>
      
      <div class="relative z-20 text-center text-white space-y-6 container-sm animate-luxury-fade">
         <span class="text-[10px] uppercase font-black tracking-[0.4em] text-luxury-gold drop-shadow-lg">Store Officiel</span>
         <h1 class="text-6xl md:text-8xl font-display uppercase tracking-widest leading-none drop-shadow-2xl">
           {{ categoryData.category.name }}
         </h1>
         <div class="w-12 h-0.5 bg-luxury-gold mx-auto" />
      </div>
    </section>

    <!-- Collection Control Bar -->
    <div class="sticky top-20 z-[100] bg-white/95 backdrop-blur-md border-b border-luxury-border py-4">
      <div class="container-sm flex justify-between items-center">
        <div class="flex items-center gap-4">
           <span class="text-[10px] font-black uppercase tracking-widest text-luxury-muted">
             {{ categoryData.products.length }} Objets Trouvés
           </span>
        </div>
        
        <div class="flex items-center gap-6">
           <select 
             v-model="sortBy" 
             class="bg-transparent border-none text-[10px] font-black uppercase tracking-widest cursor-pointer focus:ring-0"
           >
             <option value="featured">Tri: Sélection</option>
             <option value="price-asc">Prix: Croissant</option>
             <option value="price-desc">Prix: Décroissant</option>
           </select>
        </div>
      </div>
    </div>

    <!-- Product Grid -->
    <section class="py-16 bg-luxury-cream/20">
      <div class="container-sm">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          <ProductCard 
            v-for="product in sortedProducts" 
            :key="product.id" 
            :product="product" 
          />
        </div>

        <!-- Empty State -->
        <div v-if="sortedProducts.length === 0" class="py-32 text-center space-y-4">
           <span class="i-heroicons-face-frown text-4xl text-luxury-muted block mx-auto" />
           <p class="text-[10px] uppercase font-bold text-luxury-muted">Aucun produit disponible dans cette catégorie</p>
           <NuxtLink to="/" class="btn-primary inline-block px-8 py-4">Visiter La Boutique</NuxtLink>
        </div>
      </div>
    </section>

    <TrustBadge />
  </div>
</template>

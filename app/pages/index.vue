<script setup lang="ts">
// 1. Parallel Fetching for Landing Speed
const { data: featured } = await useFetch('/api/products', { 
  query: { featured: 'true', limit: 4 },
  lazy: true
})

const { data: categories } = await useFetch('/api/categories', { 
  lazy: true 
})
</script>

<template>
  <main>
    <!-- Hero Section: Prestige Focus -->
    <section class="relative h-[85vh] flex items-center overflow-hidden bg-luxury-black">
      <div class="absolute inset-0 opacity-60">
        <NuxtImg 
          src="https://images.unsplash.com/photo-1596462502278-27bfdc4023c6?q=80&w=1920" 
          class="w-full h-full object-cover"
          priority
        />
      </div>
      
      <div class="container-sm relative z-10 text-white">
        <div class="max-w-2xl animate-luxury-fade">
          <span class="text-xs font-bold uppercase tracking-[0.5em] mb-4 block">Nouvelle Collection</span>
          <h1 class="text-6xl md:text-8xl font-display mb-8">Révélez Votre Éclat Naturel</h1>
          <p class="text-lg mb-10 text-white/80 font-light max-w-lg leading-relaxed">
            Découvrez une sélection exclusive de soins de luxe conçus pour sublimer votre beauté unique.
          </p>
          <NuxtLink to="/products" class="btn-primary bg-white text-luxury-black hover:bg-luxury-gold hover:text-white border-none">
            Acheter Maintenant
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Trust Bar: Quick Validation -->
    <section class="py-12 border-b border-luxury-border bg-luxury-cream">
      <div class="container-sm flex flex-wrap justify-center md:justify-between gap-8 text-center md:text-left">
        <div class="flex items-center gap-4">
          <span class="i-heroicons-truck text-2xl text-luxury-gold" />
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest">Livraison Gratuite</p>
            <p class="text-[10px] text-luxury-muted">À partir de 500 MAD d'achat</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="i-heroicons-shield-check text-2xl text-luxury-gold" />
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest">Paiement Sécurisé</p>
            <p class="text-[10px] text-luxury-muted">Transaction 100% chiffrée</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="i-heroicons-sparkles text-2xl text-luxury-gold" />
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest">Qualité Premium</p>
            <p class="text-[10px] text-luxury-muted">Sélectionnée par nos experts</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories: Visual Navigation -->
    <section class="py-24 container-sm">
      <div class="flex flex-col md:flex-row justify-between items-end mb-12">
        <div class="max-w-md">
          <h2 class="text-4xl mb-4">Parcourir Par Catégorie</h2>
          <p class="text-xs text-luxury-muted uppercase tracking-widest">Sublimez chaque aspect de votre routine</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink 
          v-for="cat in categories" 
          :key="cat.id"
          :to="`/categories/${cat.slug}`"
          class="relative h-[400px] group overflow-hidden bg-luxury-cream"
        >
          <NuxtImg 
            :src="cat.image || 'https://via.placeholder.com/400x600'" 
            class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <span class="text-white font-bold uppercase text-xs tracking-[0.3em]">{{ cat.name }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Trending: Revenue Driver -->
    <section class="py-24 bg-luxury-cream/30">
      <div class="container-sm">
        <div class="text-center mb-16">
          <h2 class="text-4xl mb-4">Tendances Actuelles</h2>
          <div class="w-20 h-[1px] bg-luxury-gold mx-auto"></div>
        </div>
        
        <div v-if="featured" class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <ProductCard 
            v-for="prod in featured" 
            :key="prod.id" 
            :product="prod" 
          />
        </div>
      </div>
    </section>
  </main>
</template>

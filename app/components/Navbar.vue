<script setup lang="ts">
const cartStore = useCartStore()
const isScrolled = ref(false)

if (process.client) {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  })
}
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-[1000] transition-all duration-500"
    :class="isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'"
  >
    <div class="container-sm flex items-center justify-between">
      <!-- Mega Menu Toggle (Mobile) -->
      <button class="md:hidden text-2xl text-luxury-black">
        <span class="i-heroicons-bars-3-bottom-left" />
      </button>

      <!-- Logo -->
      <NuxtLink to="/" class="flex flex-col items-center group">
        <span class="text-2xl font-display tracking-[0.2em] uppercase group-hover:text-luxury-gold transition-colors" :class="isScrolled ? 'text-luxury-black' : 'text-white'">EL-WALI</span>
        <span class="text-[8px] uppercase tracking-[0.5em]" :class="isScrolled ? 'text-luxury-gold' : 'text-white/60'">Luxury Beauty</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-10">
        <NuxtLink 
          v-for="link in ['Nouveautés', 'Maquillage', 'Soins', 'Parfums']" 
          :key="link"
          to="/products"
          class="text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-luxury-gold"
          :class="isScrolled ? 'text-luxury-black' : 'text-white'"
        >
          {{ link }}
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-6">
        <button class="hidden md:block transition-colors hover:text-luxury-gold" :class="isScrolled ? 'text-luxury-black' : 'text-white'">
          <span class="i-heroicons-magnifying-glass text-xl" />
        </button>
        
        <NuxtLink to="/checkout" class="relative group flex items-center gap-2">
          <span class="i-heroicons-shopping-bag text-xl group-hover:text-luxury-gold transition-colors" :class="isScrolled ? 'text-luxury-black' : 'text-white'" />
          <span 
            v-if="cartStore.itemCount > 0" 
            class="absolute -top-2 -right-2 bg-luxury-gold text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce"
          >
            {{ cartStore.itemCount }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
// These refs allow us to trigger the global overlays from the mobile bar
const searchOverlay = inject('searchOverlay') as any
const cartDrawer = inject('cartDrawer') as any
</script>

<template>
  <div class="md:hidden fixed bottom-6 left-6 right-6 z-[2500]">
     <div class="bg-black/90 backdrop-blur-xl border border-white/10 rounded-full h-16 px-8 flex items-center justify-between shadow-2xl">
        
        <!-- Home -->
        <NuxtLink to="/" class="flex flex-col items-center justify-center text-white/60 hover:text-luxury-gold transition-colors">
           <span class="i-heroicons-home text-xl" />
        </NuxtLink>

        <!-- Search -->
        <button @click="searchOverlay?.open()" class="flex flex-col items-center justify-center text-white/60 hover:text-luxury-gold transition-colors">
           <span class="i-heroicons-magnifying-glass text-xl" />
        </button>

        <!-- Dynamic Action: Shop -->
        <NuxtLink to="/products" class="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center -mt-12 border-4 border-black/90 shadow-luxury">
           <span class="i-heroicons-shopping-bag text-white text-xl" />
        </NuxtLink>

        <!-- Tracking -->
        <NuxtLink to="/tracking" class="flex flex-col items-center justify-center text-white/60 hover:text-luxury-gold transition-colors">
           <span class="i-heroicons-truck text-xl" />
        </NuxtLink>

        <!-- Cart -->
        <button @click="cartDrawer?.open()" class="relative flex flex-col items-center justify-center text-white/60 hover:text-luxury-gold transition-colors">
           <span class="i-heroicons-shopping-cart text-xl" />
           <span v-if="cartStore.itemCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-luxury-gold text-white text-[8px] font-black rounded-full flex items-center justify-center">
             {{ cartStore.itemCount }}
           </span>
        </button>

     </div>
  </div>
</template>

<style scoped>
.shadow-luxury {
  box-shadow: 0 0 20px rgba(181, 149, 87, 0.4);
}
</style>

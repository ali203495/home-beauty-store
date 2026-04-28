<script setup lang="ts">
const searchOverlay = ref()
const cartDrawer = ref()

// 1. Global Overlay Provider
provide('searchOverlay', searchOverlay)
provide('cartDrawer', cartDrawer)

// 2. Global Head Configuration (Luxury Typography)
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' }
  ]
})
</script>

<template>
  <div class="luxury-app min-h-screen flex flex-col overflow-x-hidden">
    <Navbar />
    
    <main class="flex-grow">
      <NuxtPage />
    </main>

    <Footer />
    
    <!-- Global Overlays -->
    <SearchOverlay ref="searchOverlay" />
    <CartDrawer ref="cartDrawer" />
    
    <!-- Mobile Terminal -->
    <MobileNav />
  </div>
</template>

<style>
/* Global Transition for Page Navigation */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>

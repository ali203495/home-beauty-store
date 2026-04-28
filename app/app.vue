<script setup lang="ts">
const searchOverlay = ref()
const cartDrawer = ref()

// 1. Global Overlay Provider
provide('searchOverlay', searchOverlay)
provide('cartDrawer', cartDrawer)
</script>

<template>
  <div class="luxury-app min-h-screen flex flex-col overflow-x-hidden">
    <PromoBanner />
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
/* 🖋️ GLOBAL PRESTIGE TRANSITIONS */
.page-enter-active,
.page-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  filter: blur(10px);
}

/* Scroll Smoothing */
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}
</style>

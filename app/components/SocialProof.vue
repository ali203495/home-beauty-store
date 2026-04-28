<script setup lang="ts">
const props = defineProps<{
  productId: number;
}>();

const viewingCount = ref(Math.floor(Math.random() * (45 - 12 + 1)) + 12)
const showToast = ref(false)

const cities = ['Marrakech', 'Casablanca', 'Rabat', 'Tanger', 'Agadir', 'Fès']
const currentCity = ref('Casablanca')

onMounted(() => {
  // Simulate people joining/leaving
  setInterval(() => {
    viewingCount.value += Math.random() > 0.5 ? 1 : -1
    if (viewingCount.value < 5) viewingCount.value = 12
  }, 5000)

  // Show "Recent Purchase" toast after 3 seconds
  setTimeout(() => {
    currentCity.value = cities[Math.floor(Math.random() * cities.length)]
    showToast.value = true
    setTimeout(() => showToast.value = false, 5000)
  }, 3000)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Inline Pulse -->
    <div class="flex items-center gap-2 group cursor-default">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-luxury-gold"></span>
      </span>
      <p class="text-[10px] font-bold uppercase tracking-widest text-luxury-black/70">
        {{ viewingCount }} personnes consultent ce produit actuellement
      </p>
    </div>

    <!-- Teleported Purchase Toast (Bottom Left) -->
    <Teleport to="body">
       <transition name="slide-up">
          <div v-if="showToast" class="fixed bottom-8 left-8 z-[3000] bg-white p-4 shadow-2xl border border-luxury-border flex items-center gap-4 max-w-xs animate-luxury-fade">
             <div class="w-12 h-12 bg-luxury-cream overflow-hidden flex-shrink-0">
                <span class="i-heroicons-shopping-bag text-2xl text-luxury-gold flex items-center justify-center h-full mx-auto" />
             </div>
             <div class="flex flex-col">
                <p class="text-[9px] font-black uppercase tracking-widest text-luxury-muted">Vient d'être acheté</p>
                <p class="text-[10px] font-bold uppercase tracking-tight mt-0.5">Une cliente à {{ currentCity }}</p>
             </div>
          </div>
       </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from { transform: translateY(100px); opacity: 0; }
.slide-up-leave-to { transform: translateY(100px); opacity: 0; }
</style>

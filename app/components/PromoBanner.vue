<script setup lang="ts">
const timeLeft = ref('00:00:00')
const isVisible = ref(true)

// Simulation of a launch countdown (ending in 24 hours)
onMounted(() => {
  const targetDate = new Date()
  targetDate.setHours(targetDate.getHours() + 24)

  const updateBanner = () => {
    const now = new Date().getTime()
    const diff = targetDate.getTime() - now
    
    if (diff <= 0) {
      isVisible.value = false
      return
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    timeLeft.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const timer = setInterval(updateBanner, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <transition name="fade-slide">
    <div v-if="isVisible" class="fixed top-24 left-1/2 -translate-x-1/2 z-[900] w-[95%] max-w-4xl">
      <div class="bg-black/80 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-2xl flex items-center justify-between shadow-2xl">
        <div class="flex items-center gap-4 px-2">
           <div class="hidden md:flex w-10 h-10 bg-luxury-gold/20 rounded-xl items-center justify-center text-luxury-gold">
              <span class="i-heroicons-bolt text-lg" />
           </div>
           <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold leading-none">Offre de Lancement</p>
              <p class="text-xs font-bold text-white mt-1 uppercase tracking-tight">Livraison Gratuite + -15% sur tout le site</p>
           </div>
        </div>

        <div class="flex items-center gap-6">
           <div class="flex flex-col items-end">
              <p class="text-[8px] font-black uppercase tracking-widest text-white/40">Se termine dans</p>
              <p class="text-lg font-display font-black text-white tabular-nums tracking-tighter">{{ timeLeft }}</p>
           </div>
           <button @click="isVisible = false" class="text-white/40 hover:text-white transition-colors">
              <span class="i-heroicons-x-mark text-lg" />
           </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>

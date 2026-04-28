<script setup lang="ts">
const cartStore = useCartStore()
const isOpen = ref(false)

// 1. Accessibility & Body Lock
watch(isOpen, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

const freeShippingThreshold = 500
const progress = computed(() => Math.min((cartStore.total / freeShippingThreshold) * 100, 100))
const remaining = computed(() => Math.max(freeShippingThreshold - cartStore.total, 0))

defineExpose({ open: () => isOpen.value = true, close: () => isOpen.value = false })
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm" @click="isOpen = false" />
    </transition>

    <transition name="slide">
      <div v-if="isOpen" class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[2001] shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-luxury-border flex justify-between items-center bg-white">
          <h2 class="text-xl font-display uppercase tracking-widest">Votre Panier <span class="text-xs font-sans text-luxury-muted">({{ cartStore.itemCount }})</span></h2>
          <button @click="isOpen = false" class="text-2xl text-luxury-black hover:text-luxury-gold transition-colors">
            <span class="i-heroicons-x-mark" />
          </button>
        </div>

        <!-- Free Shipping Tracker (Psychological Trigger) -->
        <div class="px-6 py-4 bg-luxury-cream/50 border-b border-luxury-border">
          <p class="text-[10px] uppercase font-bold tracking-widest mb-2">
            <span v-if="remaining > 0">Plus que <span class="text-luxury-gold">{{ remaining }} MAD</span> pour la livraison gratuite</span>
            <span v-else class="text-green-600">Félicitations ! Livraison Gratuite Offerte</span>
          </p>
          <div class="w-full h-1 bg-luxury-border rounded-full overflow-hidden">
            <div 
              class="h-full bg-luxury-gold transition-all duration-1000 ease-out" 
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Items -->
        <div class="flex-grow overflow-y-auto p-6 space-y-6">
          <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-center space-y-4">
            <span class="i-heroicons-shopping-bag text-6xl text-luxury-border" />
            <p class="text-luxury-muted font-light uppercase text-xs tracking-widest">Votre panier est vide</p>
            <button @click="isOpen = false" class="btn-primary py-3 px-6 text-[10px]">Continuer Shopping</button>
          </div>

          <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4 animate-luxury-fade">
            <div class="w-24 h-24 bg-luxury-cream overflow-hidden flex-shrink-0">
               <img :src="JSON.parse(item.images || '[]')[0]" class="w-full h-full object-cover" />
            </div>
            <div class="flex-grow flex flex-col justify-between py-1">
              <div>
                <h3 class="text-[10px] font-bold uppercase tracking-wider text-luxury-black">{{ item.name }}</h3>
                <p class="text-sm font-black mt-1">{{ item.price }} MAD</p>
              </div>
              
              <div class="flex justify-between items-center">
                <div class="flex items-center border border-luxury-border">
                  <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="px-3 py-1 text-luxury-muted hover:text-luxury-black">-</button>
                  <span class="px-2 text-xs font-bold">{{ item.quantity }}</span>
                  <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)" class="px-3 py-1 text-luxury-muted hover:text-luxury-black">+</button>
                </div>
                <button @click="cartStore.removeItem(item.id)" class="text-[10px] uppercase font-bold text-red-600 underline underline-offset-4">Supprimer</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-luxury-border bg-white space-y-4">
          <div class="flex justify-between items-end">
            <span class="text-xs uppercase font-bold text-luxury-muted tracking-widest">Sous-Total</span>
            <span class="text-xl font-black">{{ cartStore.total }} MAD</span>
          </div>
          <p class="text-[10px] text-luxury-muted text-center italic">Taxes et frais de livraison calculés à l'étape suivante</p>
          <NuxtLink to="/checkout" class="btn-primary w-full text-center py-5" @click="isOpen = false">
            Passer à la Caisse
          </NuxtLink>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from { transform: translateX(100%); }
.slide-leave-to { transform: translateX(100%); }
</style>

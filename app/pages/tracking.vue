<script setup lang="ts">
const trackingId = ref('')
const order = ref(null)
const loading = ref(false)
const error = ref('')

const trackOrder = async () => {
  if (!trackingId.value) return
  
  loading.value = true
  error.value = ''
  order.value = null
  
  try {
    const data = await $fetch(`/api/orders/track`, {
      query: { id: trackingId.value }
    })
    
    if (data.success) {
      order.value = data.order
    } else {
      error.value = 'Commande introuvable. Veuillez vérifier votre ID.'
    }
  } catch (e) {
    error.value = 'Une erreur est survenue lors du suivi.'
  } finally {
    loading.value = false
  }
}

const statusMap = {
  'pending': { label: 'En attente', color: 'bg-luxury-gold' },
  'processing': { label: 'En préparation', color: 'bg-blue-500' },
  'shipped': { label: 'Expédiée', color: 'bg-green-500' },
  'completed': { label: 'Livrée', color: 'bg-luxury-black' },
  'failed': { label: 'Annulée', color: 'bg-red-500' }
}
</script>

<template>
  <div class="bg-luxury-cream min-h-screen pt-32 pb-24">
    <div class="container-sm">
      <div class="max-w-2xl mx-auto space-y-12">
        <!-- Header -->
        <div class="text-center space-y-4">
          <h1 class="text-5xl font-display uppercase tracking-widest leading-tight">Suivi de Commande</h1>
          <p class="text-luxury-muted font-light uppercase text-xs tracking-[0.2em]">Entrez votre numéro de commande pour connaître son état</p>
        </div>

        <!-- Input -->
        <div class="bg-white p-8 md:p-12 shadow-sm border border-luxury-border">
          <div class="flex flex-col md:flex-row gap-4">
            <input 
              v-model="trackingId"
              type="text" 
              placeholder="Ex: ORD-123456" 
              class="input-luxury flex-grow"
              @keyup.enter="trackOrder"
            />
            <button @click="trackOrder" :disabled="loading" class="btn-primary flex items-center justify-center gap-2">
              <span v-if="!loading">Suivre</span>
              <span v-else class="i-heroicons-arrow-path animate-spin" />
            </button>
          </div>
          <p v-if="error" class="text-[10px] font-bold text-red-600 uppercase mt-4">{{ error }}</p>
        </div>

        <!-- Result -->
        <transition name="fade">
          <div v-if="order" class="bg-white p-8 md:p-12 border-2 border-luxury-black animate-luxury-fade">
             <div class="flex justify-between items-start border-b border-luxury-border pb-8 mb-8">
                <div>
                   <h2 class="text-[10px] font-black uppercase tracking-widest text-luxury-muted">Statut Actuel</h2>
                   <div class="flex items-center gap-2 mt-2">
                      <div class="w-3 h-3 rounded-full" :class="statusMap[order.status].color"></div>
                      <span class="text-2xl font-display uppercase">{{ statusMap[order.status].label }}</span>
                   </div>
                </div>
                <div class="text-right">
                   <p class="text-[10px] font-black uppercase tracking-widest text-luxury-muted">Commande N°</p>
                   <p class="text-xl font-black mt-1">#{{ order.id }}</p>
                </div>
             </div>

             <div class="space-y-6">
                <!-- Timeline Placeholder -->
                <div class="flex gap-4">
                   <div class="flex flex-col items-center">
                      <div class="w-4 h-4 rounded-full bg-luxury-black"></div>
                      <div class="w-0.5 h-12 bg-luxury-black"></div>
                      <div class="w-4 h-4 rounded-full border-2 border-luxury-border"></div>
                   </div>
                   <div class="space-y-12 pt-0.5">
                      <div>
                         <p class="text-[10px] font-bold uppercase">Commande Reçue</p>
                         <p class="text-[10px] text-luxury-muted uppercase">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
                      </div>
                      <div>
                         <p class="text-[10px] font-bold uppercase text-luxury-muted">Préparation & Expédition</p>
                         <p class="text-[10px] text-luxury-muted uppercase">Estimation: 24h - 48h</p>
                      </div>
                   </div>
                </div>

                <div class="pt-8 border-t border-luxury-border">
                   <p class="text-[10px] text-luxury-muted leading-relaxed uppercase tracking-widest">
                      Pour toute question concernant votre livraison, contactez-nous via WhatsApp avec votre numéro de commande.
                   </p>
                </div>
             </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

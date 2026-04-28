<script setup lang="ts">
const cartStore = useCartStore()
const loading = ref(false)
const orderCompleted = ref(false)

const form = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  checkoutId: crypto.randomUUID()
})

const handleCheckout = async () => {
  if (!form.value.customerName || !form.value.customerPhone) return;
  
  loading.value = true;
  try {
    const response = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        ...form.value,
        items: cartStore.items,
        totalAmount: cartStore.total
      }
    });

    if (response.success) {
      orderCompleted.value = true;
      cartStore.clear();
    }
  } catch (e) {
    console.error('Checkout failed:', e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-luxury-cream min-h-screen py-12 md:py-24">
    <div class="container-sm">
      <div v-if="!orderCompleted" class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <!-- Order Summary (Mobile First) -->
        <div class="lg:col-span-5 lg:order-2">
          <div class="glass-card p-8 space-y-6">
            <h2 class="text-xl font-display border-b border-luxury-border pb-4">Résumé de commande</h2>
            
            <div class="space-y-4 max-h-[400px] overflow-auto pr-2">
              <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4">
                <div class="w-20 h-20 bg-luxury-cream overflow-hidden">
                   <img :src="JSON.parse(item.images || '[]')[0]" class="w-full h-full object-cover" />
                </div>
                <div class="flex-grow">
                  <p class="text-xs font-bold uppercase tracking-wider">{{ item.name }}</p>
                  <p class="text-[10px] text-luxury-muted uppercase">Qté: {{ item.quantity }}</p>
                  <p class="text-xs font-black mt-2">{{ item.price }} MAD</p>
                </div>
              </div>
            </div>

            <div class="border-t border-luxury-border pt-6 space-y-4">
              <div class="flex justify-between text-xs text-luxury-muted uppercase tracking-widest">
                <span>Sous-total</span>
                <span>{{ cartStore.total }} MAD</span>
              </div>
              <div class="flex justify-between text-xs text-luxury-muted uppercase tracking-widest">
                <span>Livraison</span>
                <span class="text-green-600 font-bold">OFFERT</span>
              </div>
              <div class="flex justify-between text-lg font-black pt-4 border-t border-luxury-border">
                <span>Total</span>
                <span>{{ cartStore.total }} MAD</span>
              </div>
            </div>
            
            <div class="bg-luxury-black/5 p-4 flex items-start gap-3">
              <span class="i-heroicons-lock-closed text-luxury-gold" />
              <p class="text-[10px] text-luxury-muted leading-relaxed uppercase tracking-tighter">
                Votre transaction est sécurisée par le protocole SSL 256 bits. Les données bancaires ne sont jamais stockées sur nos serveurs.
              </p>
            </div>
          </div>
        </div>

        <!-- Checkout Form -->
        <div class="lg:col-span-7 lg:order-1">
          <div class="bg-white p-8 md:p-12 shadow-sm border border-luxury-border">
            <h1 class="text-3xl font-display mb-8">Informations de Livraison</h1>
            
            <form @submit.prevent="handleCheckout" class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] uppercase font-bold text-luxury-muted tracking-widest">Nom Complet</label>
                  <input v-model="form.customerName" type="text" class="input-luxury" placeholder="Sarah ..." required />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] uppercase font-bold text-luxury-muted tracking-widest">Téléphone</label>
                  <input v-model="form.customerPhone" type="tel" class="input-luxury" placeholder="06 ..." required />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase font-bold text-luxury-muted tracking-widest">Adresse E-mail (Optionnel)</label>
                <input v-model="form.customerEmail" type="email" class="input-luxury" placeholder="sarah@example.com" />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase font-bold text-luxury-muted tracking-widest">Adresse de Livraison</label>
                <textarea v-model="form.shippingAddress" rows="3" class="input-luxury" placeholder="Rue, Ville, Code Postal" required></textarea>
              </div>

              <div class="pt-8">
                <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-3">
                  <span v-if="!loading">Confirmer La Commande</span>
                  <span v-else class="animate-spin i-heroicons-arrow-path" />
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <!-- Success State -->
      <div v-else class="max-w-xl mx-auto py-24 text-center space-y-8 animate-luxury-fade">
        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span class="i-heroicons-check-circle text-6xl text-green-600" />
        </div>
        <h1 class="text-4xl font-display">Merci pour votre confiance !</h1>
        <p class="text-luxury-muted leading-relaxed font-light">
          Votre commande a été enregistrée avec succès. Notre équipe vous contactera dans les plus brefs délais pour confirmer la livraison.
        </p>
        <NuxtLink to="/products" class="btn-primary inline-block">Continuer Shopping</NuxtLink>
      </div>
    </div>
  </div>
</template>

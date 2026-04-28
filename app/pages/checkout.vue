<script setup lang="ts">
const cartStore = useCartStore()
const loading = ref(false)
const orderPlaced = ref(false)
const orderId = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: 'Marrakech',
  paymentMethod: 'cod' // Cash on delivery (Standard for the region)
})

const placeOrder = async () => {
  if (cartStore.items.length === 0) return
  
  loading.value = true
  try {
    const response = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        ...form,
        items: cartStore.items,
        total: cartStore.total,
        checkoutId: crypto.randomUUID()
      }
    })
    
    if (response.success) {
      orderId.value = response.orderId
      orderPlaced.value = true
      cartStore.clearCart()
    }
  } catch (e) {
    alert('Une erreur est survenue. Veuillez réessayer.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-luxury-cream min-h-screen pt-32 pb-24">
    <div class="container-sm">
      <div v-if="!orderPlaced" class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <!-- Left: Checkout Form -->
        <div class="lg:col-span-7 space-y-8">
           <div class="bg-white p-8 md:p-12 border border-luxury-border">
              <h1 class="text-4xl font-display mb-10 uppercase tracking-widest leading-none">Finaliser La Commande</h1>
              
              <div class="space-y-6">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Nom Complet</label>
                       <input v-model="form.name" type="text" class="input-luxury" placeholder="Votre nom complet" />
                    </div>
                    <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Téléphone (WhatsApp)</label>
                       <input v-model="form.phone" type="tel" class="input-luxury" placeholder="Ex: 06 12 34 56 78" />
                    </div>
                 </div>

                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Email (Optionnel)</label>
                    <input v-model="form.email" type="email" class="input-luxury" placeholder="Ex: amine@gmail.com" />
                 </div>

                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Adresse De Livraison</label>
                    <textarea v-model="form.address" rows="3" class="input-luxury" placeholder="Indiquez votre adresse exacte..."></textarea>
                 </div>

                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Ville</label>
                       <select v-model="form.city" class="input-luxury">
                          <option value="Marrakech">Marrakech</option>
                          <option value="Casablanca">Casablanca</option>
                          <option value="Rabat">Rabat</option>
                          <option value="Agadir">Agadir</option>
                          <option value="Tanger">Tanger</option>
                       </select>
                    </div>
                    <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Paiement</label>
                       <div class="flex items-center gap-2 p-4 border border-luxury-border bg-luxury-cream/20">
                          <span class="i-heroicons-banknotes text-xl text-luxury-gold" />
                          <span class="text-[10px] font-bold uppercase tracking-widest">Paiement à la livraison (COD)</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Right: Order Summary Glass Panel -->
        <div class="lg:col-span-5 sticky top-24">
           <div class="bg-white p-8 border border-luxury-border space-y-8">
              <h2 class="text-xs font-black uppercase tracking-[0.3em] pb-4 border-b border-luxury-border">Votre Sélection</h2>
              
              <div class="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                 <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                    <span class="text-luxury-muted line-clamp-1">{{ item.name }} x{{ item.quantity }}</span>
                    <span>{{ item.price * item.quantity }} MAD</span>
                 </div>
              </div>

              <div class="pt-8 border-t border-luxury-border space-y-4">
                 <div class="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-luxury-muted">
                    <span>Livraison</span>
                    <span v-if="cartStore.total >= 500" class="text-green-600">Gratuite</span>
                    <span v-else>30 MAD</span>
                 </div>
                 <div class="flex justify-between items-end pt-4 border-t-2 border-luxury-black">
                    <span class="text-xs uppercase font-black tracking-widest">Total Global</span>
                    <span class="text-4xl font-display">{{ cartStore.total + (cartStore.total >= 500 ? 0 : 30) }} MAD</span>
                 </div>
              </div>

              <button 
                @click="placeOrder" 
                :disabled="loading || cartStore.items.length === 0"
                class="btn-primary w-full py-6 flex items-center justify-center gap-3"
              >
                <span v-if="loading" class="i-heroicons-arrow-path animate-spin text-xl" />
                <span v-else>Confirmer Ma Commande</span>
              </button>

              <div class="flex justify-center gap-6 pt-4 grayscale opacity-40">
                 <span class="i-heroicons-shield-check text-xl" />
                 <span class="i-heroicons-lock-closed text-xl" />
                 <span class="i-heroicons-truck text-xl" />
              </div>
           </div>
        </div>

      </div>

      <!-- Success State -->
      <div v-else class="max-w-2xl mx-auto text-center space-y-12 animate-luxury-fade py-20">
         <div class="inline-flex p-8 bg-green-50 rounded-full text-green-600 mb-4">
            <span class="i-heroicons-check-badge text-8xl" />
         </div>
         <div class="space-y-4">
            <h1 class="text-5xl font-display uppercase tracking-widest">Merci Pour Votre Confiance</h1>
            <p class="text-luxury-muted uppercase text-xs tracking-widest italic">Votre commande est en cours de préparation</p>
         </div>
         
         <div class="bg-white p-12 border border-luxury-border text-center space-y-6">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-luxury-muted">Numéro de Commande</h2>
            <p class="text-4xl font-black">#{{ orderId }}</p>
            <p class="text-xs font-light text-luxury-muted max-w-sm mx-auto leading-relaxed">
               Nous vous contacterons par WhatsApp pour confirmer les détails de livraison.
            </p>
            
            <!-- WhatsApp Action: The Conversion Closer -->
            <div class="pt-8 space-y-4">
               <a 
                 :href="`https://wa.me/${useRuntimeConfig().public.whatsappNumber}?text=Bonjour, je souhaite confirmer ma commande El-Wali # ${orderId} - Nom: ${form.name}`"
                 target="_blank"
                 class="flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 px-8 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-xl"
               >
                  <span class="i-simple-icons-whatsapp text-2xl" />
                  Confirmer via WhatsApp
               </a>
               <NuxtLink to="/" class="block text-[10px] font-bold uppercase tracking-widest text-luxury-muted hover:text-luxury-black transition-colors">
                  Retour À La Boutique
               </NuxtLink>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

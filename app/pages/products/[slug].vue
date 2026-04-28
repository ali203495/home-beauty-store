<script setup lang="ts">
const route = useRoute()
const cartStore = useCartStore()

const { data: product } = await useAsyncData(`product-${route.params.slug}`, () => 
  $fetch(`/api/products/${route.params.slug}`)
)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
}

const images = computed(() => JSON.parse(product.value?.images || '[]'))
const selectedImage = ref(0)

// 🛡️ SEO MONSTER: JSON-LD Product Schema
useHead({
  title: `${product.value.name} | El Wali Beauty`,
  meta: [
    { name: 'description', content: product.value.description },
    // Open Graph
    { property: 'og:title', content: product.value.name },
    { property: 'og:description', content: product.value.description },
    { property: 'og:image', content: images.value[0] },
    { property: 'og:type', content: 'product' },
    { property: 'product:price:amount', content: product.value.salePrice || product.value.price },
    { property: 'product:price:currency', content: 'MAD' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.value.name,
        'image': images.value,
        'description': product.value.description,
        'sku': `EW-${product.value.id}`,
        'brand': {
          '@type': 'Brand',
          'name': 'El Wali'
        },
        'offers': {
          '@type': 'Offer',
          'url': route.fullPath,
          'priceCurrency': 'MAD',
          'price': product.value.salePrice || product.value.price,
          'availability': product.value.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'itemCondition': 'https://schema.org/NewCondition'
        }
      })
    }
  ]
})
</script>

<template>
  <div class="bg-white">
    <div class="container-sm py-12 md:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        <!-- Gallery: Sticky on Scroll -->
        <div class="lg:col-span-7">
          <div class="flex flex-col gap-4 sticky top-24">
            <div class="aspect-[4/5] bg-luxury-cream overflow-hidden">
              <NuxtImg 
                :src="images[selectedImage]" 
                class="w-full h-full object-cover animate-luxury-fade"
                width="800"
                height="1000"
              />
            </div>
            <div class="grid grid-cols-4 gap-4">
              <button 
                v-for="(img, i) in images" 
                :key="i"
                @click="selectedImage = i"
                class="aspect-[4/5] bg-luxury-cream overflow-hidden border-2 transition-all"
                :class="selectedImage === i ? 'border-luxury-gold' : 'border-transparent'"
              >
                <NuxtImg :src="img" class="w-full h-full object-cover" width="200" height="250" />
              </button>
            </div>
          </div>
        </div>

        <!-- Purchase Tunnel -->
        <div class="lg:col-span-5 flex flex-col gap-8">
          <div class="border-b border-luxury-border pb-8">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-2 block">
              {{ product.category?.name || 'Exclusive' }}
            </span>
            <h1 class="text-4xl md:text-5xl mb-4 font-display leading-tight">{{ product.name }}</h1>
            
            <SocialProof :productId="product.id" />
            
            <div class="flex items-baseline gap-4 mt-6">
              <span class="text-2xl font-black">{{ product.salePrice || product.price }} MAD</span>
              <span v-if="product.salePrice" class="text-lg text-luxury-muted line-through">{{ product.price }} MAD</span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="space-y-6">
            <p class="text-luxury-muted text-sm leading-relaxed">
              {{ product.description }}
            </p>

            <div v-if="product.specifications" class="grid grid-cols-2 gap-y-4 gap-x-8 text-xs py-6 border-y border-luxury-border">
              <div v-for="(val, key) in JSON.parse(product.specifications)" :key="key">
                <span class="block text-[10px] uppercase font-bold text-luxury-muted mb-1">{{ key }}</span>
                <span class="font-black text-luxury-black font-sans uppercase">{{ val }}</span>
              </div>
            </div>

            <!-- Scarcity Trigger -->
            <div v-if="product.stock < 5 && product.stock > 0" class="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3">
              <span class="i-heroicons-exclamation-circle" />
              Pressez-vous ! Seulement {{ product.stock }} articles restants.
            </div>

            <div class="pt-4 space-y-4">
              <AddToCartButton :productId="product.id" />
              <p class="text-[10px] text-center text-luxury-muted uppercase tracking-widest mt-4">
                Paiement sécurisé • Livraison express • Retour gratuit
              </p>
            </div>
          </div>

          <!-- Trust Markers -->
          <div class="grid grid-cols-3 gap-4 pt-12 mt-12 border-t border-luxury-border">
             <div class="text-center space-y-2">
                <span class="i-heroicons-check-badge text-2xl text-luxury-gold mx-auto block" />
                <span class="text-[9px] uppercase font-black block tracking-tighter">100% Authentique</span>
             </div>
             <div class="text-center space-y-2">
                <span class="i-heroicons-arrow-path text-2xl text-luxury-gold mx-auto block" />
                <span class="text-[9px] uppercase font-black block tracking-tighter">Échange 30 Jours</span>
             </div>
             <div class="text-center space-y-2">
                <span class="i-heroicons-chat-bubble-left-right text-2xl text-luxury-gold mx-auto block" />
                <span class="text-[9px] uppercase font-black block tracking-tighter">Support Expert</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

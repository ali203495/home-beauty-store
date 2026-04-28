<script setup lang="ts">
const route = useRoute()
const { trackProductView } = useAnalytics()
const cartStore = useCartStore()

// 1. SSR Data Fetching with Caching
const { data: product, error } = await useAsyncData(`product-${route.params.slug}`, () => 
  $fetch(`/api/products/${route.params.slug}`)
)

if (error.value || !product.value) {
   throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
}

// 2. SOCIAL PROOF (Revenue Engine)
const { data: socialProof } = await useFetch(`/api/products/social-proof`, {
  query: { productId: product.value?.id },
  lazy: true,
  server: false // Clientside only for real-time feel
})

// 3. SEO & Schema
useSeoMeta({
  title: `${product.value.name} | EL-WALI SHOP`,
  description: product.value.description,
  ogImage: JSON.parse(product.value.images || '[]')[0],
})

// JSON-LD for Google Search
useHead({
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.value.name,
      "image": JSON.parse(product.value.images || '[]'),
      "description": product.value.description,
      "brand": { "@type": "Brand", "name": "EL-WALI" },
      "offers": {
        "@type": "Offer",
        "url": `https://el-wali.com/products/${product.value.slug}`,
        "priceCurrency": "MAD",
        "price": product.value.salePrice || product.value.price,
        "availability": product.value.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    })
  }]
})

onMounted(() => {
  trackProductView(product.value)
})

const selectedImage = ref(0)
const images = computed(() => JSON.parse(product.value?.images || '[]'))
</script>

<template>
  <div class="product-page container section-padding fade-in-up">
    <div class="product-grid">
       <!-- Gallery (Mobile Swipe Optimized) -->
       <div class="gallery">
          <div class="main-image-wrapper card">
             <div class="image-inner">
                <NuxtImg 
                  :src="images[selectedImage]" 
                  class="main-image"
                  width="800"
                  height="800"
                  format="webp"
                  priority="true"
                />
             </div>
          </div>
          <div class="thumbnails-container">
             <div class="thumbnails">
                <div 
                  v-for="(img, i) in images" 
                  :key="i"
                  class="thumb card"
                  :class="{ 'is-active': selectedImage === i }"
                  @click="selectedImage = i"
                >
                   <NuxtImg :src="img" width="100" height="100" />
                </div>
             </div>
          </div>
       </div>

       <!-- Info -->
       <div class="info">
          <div class="breadcrumb">Home / {{ product.category?.name }} / {{ product.name }}</div>
          <div v-if="socialProof?.isHot" class="hot-badge animate-pulse">
             🔥 Current Interest: <span>{{ socialProof.popularity }} viewing now</span>
          </div>
          
          <h1 class="title-lg">{{ product.name }}</h1>
          
          <div v-if="socialProof?.recentlyBought > 0" class="social-trust">
             🤝 {{ socialProof.recentlyBought }} orders in the last 24h
          </div>

          <div class="price-section">
             <span class="price-main">${{ product.salePrice || product.price }}</span>
             <span v-if="product.salePrice" class="price-discount">-${{ Math.round((1 - product.salePrice/product.price)*100) }}%</span>
          </div>

          <div class="stock-status" :class="{ 'is-low': product.stock < 5 }">
             <div class="indicator"></div>
             <span>{{ product.stock > 0 ? `${product.stock} units available` : 'Out of Stock' }}</span>
          </div>

          <p class="description">{{ product.description }}</p>

          <!-- Specifications -->
          <div v-if="product.specifications" class="spec-grid">
             <div v-for="(val, key) in JSON.parse(product.specifications)" :key="key" class="spec-item">
                <label>{{ key }}</label>
                <span>{{ val }}</span>
             </div>
          </div>

          <div class="actions desktop-only">
             <AppButton @click="cartStore.addItem(product)" variant="primary" class="btn-large">
                Add to Basket
             </AppButton>
          </div>
       </div>
    </div>

    <!-- Mobile Sticky CTA -->
    <div class="sticky-cta mobile-only">
       <div class="cta-price">${{ product.salePrice || product.price }}</div>
       <AppButton @click="cartStore.addItem(product)" variant="primary">Add To Card</AppButton>
    </div>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  contain: paint;
}

.image-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.thumbnails-container::-webkit-scrollbar { display: none; }

.thumbnails {
  display: flex;
  gap: 0.75rem;
  padding: 0.25rem;
  width: max-content;
}

.thumb {
  width: 80px;
  height: 80px;
  padding: 0;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumb.is-active {
  border-color: var(--primary);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price-main {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-dark);
}

.price-discount {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  font-weight: 800;
  border-radius: var(--radius-full);
}

.stock-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.stock-status.is-low .indicator { background: #f59e0b; }

.description {
  color: var(--text-muted);
  line-height: 1.6;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
}

.spec-item label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.spec-item span { font-weight: 600; }

.btn-large { width: 100%; padding: 1.25rem; font-size: 1.1rem; }

.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  z-index: 1000;
}

.hot-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ef4444;
  background: #fef2f2;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  width: fit-content;
}

.social-trust {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .7; }
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: 1fr; gap: 2rem; }
  .desktop-only { display: none; }
}

@media (min-width: 1025px) {
  .mobile-only { display: none; }
}
</style>

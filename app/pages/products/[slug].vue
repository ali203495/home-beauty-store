<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

const { data: product } = await useFetch(`/api/products/${slug}`)

if (!product.value) {
   throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

const { data: relatedProducts } = await useFetch('/api/products', {
   query: { category: product.value.categoryId },
   transform: (res: any) => res.filter((p: any) => p.id !== product.value.id).slice(0, 4)
})

useSeoMeta({
  title: `${product.value.name} | EL-WALI SHOP`,
  description: product.value.description?.slice(0, 160),
  ogTitle: product.value.name,
  ogImage: JSON.parse(product.value.images || '[]')[0],
})

const activeImg = ref(JSON.parse(product.value.images || '[]')[0] || '')

// Enterprise Tracking: Record product view for smarter recommendations
onMounted(async () => {
   if (product.value) {
      await $fetch('/api/tracking/view', {
         method: 'POST',
         body: { productId: product.value.id }
      })
   }
})
</script>


<template>
  <div class="product-editorial container section-padding">
    <div class="product-stage fade-in-up">
       <!-- Gallery -->
       <div class="gallery-wrapper">
          <div class="stage-img card">
             <img :src="activeImg" :alt="product.name">
          </div>
          <div class="stage-thumbs">
             <div 
               v-for="(img, i) in JSON.parse(product.images || '[]')" 
               :key="i"
               class="thumb-box card"
               :class="{active: activeImg === img}"
               @click="activeImg = img"
             >
                <img :src="img">
             </div>
          </div>
       </div>

       <!-- Purchase Info -->
       <div class="purchase-wrapper">
          <div class="meta-row">
             <NuxtLink :to="`/categories/${product.category?.slug}`" class="cat-pill">
               {{ product.category?.name }}
             </NuxtLink>
             <span class="sku">ID: #00{{ product.id }}</span>
          </div>

          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="brand-row">
             By <NuxtLink :to="`/products?brand=${product.brandId}`" class="brand-link">{{ product.brand?.name }}</NuxtLink>
          </div>

          <div class="price-terminal card">
             <div class="price-display">
                <span v-if="product.salePrice" class="main-price">${{ product.salePrice }}</span>
                <span :class="{'strike-price': product.salePrice, 'main-price': !product.salePrice}">${{ product.price }}</span>
             </div>
             <p v-if="product.stock > 0" class="stock-info in">✔ In Stock - Ready to ship</p>
             <p v-else class="stock-info out">✖ Out of Stock</p>

             <div class="add-block">
                <div class="qty-btn">1</div>
                <button class="btn btn-primary btn-xl">Add to Basket</button>
             </div>
          </div>

          <div class="trust-badges">
             <div class="badge"><span class="icon">🚚</span> Free Shipping</div>
             <div class="badge"><span class="icon">💰</span> 30 Days Return</div>
             <div class="badge"><span class="icon">🛡️</span> 2 Year Warranty</div>
          </div>
       </div>
    </div>

    <!-- Details Section -->
    <section class="details-tabs section-padding">
       <div class="tabs-header">
          <button class="tab-btn active">Description</button>
          <button class="tab-btn">Specifications</button>
          <button class="tab-btn">Shipping Info</button>
       </div>
       <div class="tab-content card">
          <p class="desc-text">{{ product.description }}</p>
       </div>
    </section>

    <!-- Related Products -->
    <section v-if="relatedProducts?.length" class="related-section section-padding">
       <h2 class="title-sm">You Might Also Like</h2>
       <div class="catalog-grid">
           <div v-for="rp in relatedProducts" :key="rp.id" class="product-card card hover-lift">
              <NuxtLink :to="`/products/${rp.slug}`" class="product-img">
                 <img :src="JSON.parse(rp.images || '[]')[0]" :alt="rp.name">
              </NuxtLink>
              <div class="product-info">
                 <NuxtLink :to="`/products/${rp.slug}`" class="product-name">{{ rp.name }}</NuxtLink>
                 <span class="sale-price">${{ rp.salePrice || rp.price }}</span>
              </div>
           </div>
       </div>
    </section>
  </div>
</template>

<style scoped>
.product-stage { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; }

.stage-img img { width: 100%; border-radius: var(--radius); }
.stage-thumbs { display: flex; gap: 1rem; margin-top: 1rem; }
.thumb-box { width: 80px; height: 80px; cursor: pointer; padding: 0.25rem; transition: all 0.2s; }
.thumb-box img { width: 100%; height: 100%; object-fit: cover; }
.thumb-box.active { border-color: var(--primary); transform: scale(1.05); }

.meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.cat-pill { background: #f1f5f9; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; color: var(--secondary); text-decoration: none; }
.sku { font-size: 0.75rem; color: var(--text-muted); }

.product-title { font-size: 2.8rem; font-weight: 900; line-height: 1.1; margin-bottom: 0.5rem; }
.brand-link { color: var(--primary); font-weight: 700; }

.price-terminal { margin-top: 2rem; padding: 2rem; border-left: 5px solid var(--primary); }
.price-display { margin-bottom: 1rem; }
.main-price { font-size: 3rem; font-weight: 900; color: var(--secondary); margin-right: 1rem; }
.strike-price { font-size: 1.5rem; text-decoration: line-through; color: var(--text-muted); }

.stock-info { font-weight: 700; font-size: 0.9rem; margin-bottom: 2rem; }
.stock-info.in { color: #10b981; }
.stock-info.out { color: #ef4444; }

.add-block { display: flex; gap: 1rem; }
.qty-btn { padding: 1rem 1.5rem; border: 1px solid var(--border); border-radius: var(--radius); font-weight: 700; }
.btn-xl { flex: 1; padding: 1.25rem; font-size: 1.2rem; }

.trust-badges { display: flex; gap: 1.5rem; margin-top: 2.5rem; border-top: 1px solid var(--border); padding-top: 2rem; }
.badge { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }

.tabs-header { display: flex; border-bottom: 2px solid var(--border); margin-bottom: -2px; }
.tab-btn { padding: 1rem 2rem; background: none; border: none; font-weight: 700; opacity: 0.5; cursor: pointer; transition: all 0.2s; border-bottom: 2px solid transparent; }
.tab-btn.active { opacity: 1; border-bottom-color: var(--primary); color: var(--primary); }
.tab-content { padding: 2.5rem; border-top: none; }
.desc-text { line-height: 1.8; color: #4b5563; font-size: 1.1rem; }

.catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }

@media (max-width: 968px) {
  .product-stage { grid-template-columns: 1fr; gap: 2rem; }
  .product-title { font-size: 2rem; }
}
</style>

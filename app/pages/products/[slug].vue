<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

const { data: product } = await useFetch(`/api/products/${slug}`)

if (!product.value) {
   throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}
</script>

<template>
  <div class="product-detail container section-padding">
    <div class="breadcrumb">
       <NuxtLink to="/">Home</NuxtLink> / 
       <NuxtLink to="/products">Products</NuxtLink> / 
       <span>{{ product.name }}</span>
    </div>

    <div class="product-layout">
       <!-- Gallery -->
       <div class="gallery-side">
          <div class="main-img card">
             <img :src="JSON.parse(product.images)[0]" :alt="product.name">
          </div>
          <div class="thumbnails">
             <!-- Placeholder for more images -->
             <div class="thumb card active"><img :src="JSON.parse(product.images)[0]"></div>
          </div>
       </div>

       <!-- Info -->
       <div class="info-side">
          <div class="info-header">
             <span class="brand-badge">{{ product.brand?.name }}</span>
             <h1 class="title-md">{{ product.name }}</h1>
             <div class="rating-summary">
                <span class="stars">★★★★★</span>
                <span class="count">(0 reviews)</span>
             </div>
          </div>

          <div class="price-box">
             <div class="current-price">${{ product.salePrice || product.price }}</div>
             <div v-if="product.salePrice" class="discount-info">
                <span class="old">${{ product.price }}</span>
                <span class="save">Save ${{ (product.price - product.salePrice).toFixed(2) }}</span>
             </div>
          </div>

          <div class="stock-status" :class="{'in-stock': product.stock > 0}">
             ● {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }} ({{ product.stock }} available)
          </div>

          <div class="actions">
             <div class="qty-selector">
                <button>-</button>
                <input type="number" value="1">
                <button>+</button>
             </div>
             <button class="btn btn-primary btn-lg flex-1">Add to Cart</button>
             <button class="btn-wishlist">♡</button>
          </div>

          <div class="description-section">
             <h3>Description</h3>
             <p>{{ product.description }}</p>
          </div>

          <div class="specs-grid" v-if="product.specifications">
             <div v-for="(val, key) in JSON.parse(product.specifications)" :key="key" class="spec-row">
                <span class="spec-key">{{ key }}</span>
                <span class="spec-val">{{ val }}</span>
             </div>
          </div>
       </div>
    </div>

    <!-- Reviews Section -->
    <section class="reviews-section section-padding">
       <h2 class="title-md">Customer Reviews</h2>
       <div class="reviews-placeholder card">
          <p>No reviews yet. Be the first to review this product!</p>
          <button class="btn btn-secondary">Write a Review</button>
       </div>
    </section>
  </div>
</template>

<style scoped>
.breadcrumb { margin-bottom: 2rem; font-size: 0.9rem; color: var(--text-muted); }
.breadcrumb a:hover { color: var(--primary); }

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.main-img img { width: 100%; display: block; border-radius: var(--radius); }

.thumbnails { display: flex; gap: 1rem; margin-top: 1rem; }
.thumb { width: 80px; height: 80px; padding: 0.5rem; cursor: pointer; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb.active { border-color: var(--primary); }

.brand-badge { color: var(--primary); font-weight: 800; text-transform: uppercase; font-size: 0.8rem; }
.info-header h1 { margin: 0.5rem 0; font-size: 2.2rem; }
.rating-summary { display: flex; gap: 0.5rem; align-items: center; color: #fbbf24; }
.rating-summary .count { color: var(--text-muted); font-size: 0.8rem; }

.price-box { margin: 2rem 0; background: #f8fafc; padding: 1.5rem; border-radius: var(--radius); }
.current-price { font-size: 2.5rem; font-weight: 900; color: var(--secondary); }
.discount-info { display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem; }
.discount-info .old { text-decoration: line-through; color: var(--text-muted); }
.discount-info .save { color: #10b981; font-weight: 700; font-size: 0.9rem; }

.stock-status { font-weight: 700; margin-bottom: 2rem; font-size: 0.9rem; }
.stock-status.in-stock { color: #10b981; }

.actions { display: flex; gap: 1rem; margin-bottom: 3rem; }
.qty-selector { display: flex; border: 1px solid var(--border); border-radius: var(--radius); background: white; }
.qty-selector button { width: 40px; border: none; background: none; cursor: pointer; font-size: 1.2rem; }
.qty-selector input { width: 50px; border: none; text-align: center; font-weight: 700; outline: none; }
.btn-lg { padding: 1rem 2.5rem; font-size: 1.1rem; }
.flex-1 { flex: 1; }
.btn-wishlist { width: 56px; border: 1px solid var(--border); background: white; border-radius: var(--radius); font-size: 1.5rem; cursor: pointer; transition: all 0.2s; }
.btn-wishlist:hover { color: var(--primary); border-color: var(--primary); }

.description-section h3 { margin-bottom: 1rem; }
.description-section p { line-height: 1.6; color: #4b5563; }

.specs-grid { margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem; }
.spec-row { display: flex; padding: 0.75rem 0; border-bottom: 1px dotted var(--border); }
.spec-key { flex: 1; font-weight: 700; color: var(--text-muted); }
.spec-val { flex: 2; }

.reviews-placeholder { text-align: center; padding: 4rem; }

@media (max-width: 968px) {
  .product-layout { grid-template-columns: 1fr; gap: 2rem; }
}
</style>

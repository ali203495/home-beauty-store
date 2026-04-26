<script setup lang="ts">
const { data: categories } = await useFetch('/api/categories?rootOnly=true')
const { data: flashDeals } = await useFetch('/api/deals')
const { data: recommended } = await useFetch('/api/tracking/recommended')


useSeoMeta({
  title: 'EL-WALI SHOP | Generalist Marketplace - Mega Deals & Quality Products',
  description: 'Shop over 50,000 products with daily flash deals. Everything from kitchenware to electronics at your fingertips.'
})
</script>

<template>
  <div class="homepage">
    <!-- Recommendation Bar (As per screenshot) -->
    <div class="recommendation-bar container">
       <div class="rec-wrapper">
          <div class="rec-head">
             <span class="heart">❤️</span>
             <span>Recommandés</span>
          </div>
          <div class="rec-scroll">
             <NuxtLink v-for="cat in categories" :key="cat.id" :to="`/categories/${cat.slug}`" class="rec-item card">
                <img :src="cat.image || 'https://via.placeholder.com/30'" :alt="cat.name">
                <span>{{ cat.name }}</span>
             </NuxtLink>
          </div>
          <div class="rec-next">›</div>
       </div>
    </div>

    <!-- Hero Flash Deals -->
    <section class="deal-hero">
      <div class="container deal-inner">
        <div class="deal-content">
          <div class="deal-badge">⚡ FLASH DEALS - ENDS SOON</div>
          <h1 class="title-lg">Today's Mega Saving <br/> <span class="highlight">Up to 60% OFF</span></h1>
          <p>Don't miss out on our limited time generalist offers direct from warehouse.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-xl">Browse All 50,000+ Products</button>
          </div>
        </div>
        
        <div class="deal-display" v-if="flashDeals?.length">
           <div class="deal-card-main card">
              <div class="deal-tag">-{{ flashDeals[0].discountPercentage }}%</div>
              <div class="deal-img">
                 <img :src="JSON.parse(flashDeals[0].images)[0]" />
              </div>
              <div class="deal-info">
                 <span class="d-brand">{{ flashDeals[0].brand?.name }}</span>
                 <h3>{{ flashDeals[0].name }}</h3>
                 <div class="d-prices">
                    <span class="curr">${{ flashDeals[0].dealPrice }}</span>
                    <span class="old">${{ flashDeals[0].price }}</span>
                 </div>
                 <NuxtLink :to="`/products/${flashDeals[0].slug}`" class="btn btn-secondary w-full">Grab Offer</NuxtLink>
              </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Categories Horizontal (Standard) -->
    <section class="section-padding container">
      <div class="section-header">
        <h2 class="title-md">Departments</h2>
        <NuxtLink to="/categories" class="view-all">See All Categories</NuxtLink>
      </div>
      <div class="categories-grid">
        <NuxtLink v-for="cat in categories" :key="cat.slug" :to="`/categories/${cat.slug}`" class="category-card">
          <div class="cat-img">
            <img :src="cat.image" :alt="cat.name" />
          </div>
          <h3>{{ cat.name }}</h3>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section-padding bg-light">
      <div class="container">
        <div class="section-header">
           <h2 class="title-md">Recommended For You</h2>
           <p class="text-muted">Based on your activity and interests.</p>
        </div>
        <div class="products-grid">
          <div v-for="product in recommended" :key="product.id" class="product-card card hover-lift">
             <div class="product-img">
                <img :src="JSON.parse(product.images || '[]')[0]" :alt="product.name">
             </div>
             <div class="product-info">
                <span class="product-brand">{{ product.brand?.name }}</span>
                <NuxtLink :to="`/products/${product.slug}`" class="product-name">{{ product.name }}</NuxtLink>
                <div class="price-row">
                   <div class="prices">
                      <span v-if="product.salePrice" class="sale-price">${{ product.salePrice }}</span>
                      <span :class="{'old-price': product.salePrice}">${{ product.price }}</span>
                   </div>
                   <button class="btn-add-cart">+</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Marrakech Contact Support Section -->
    <section class="section-padding container">
       <div class="support-banner card">
          <div class="support-content">
             <h2 class="title-md">Need Help in Marrakech?</h2>
             <p>Our local team is ready to assist you with orders, logistics, and bulk inquiries within the city.</p>
             <NuxtLink to="/contact" class="btn btn-secondary">Contact Support</NuxtLink>
          </div>
          <div class="support-icon">📍</div>
       </div>
    </section>

  </div>
</template>

<style scoped>
/* Recommendation Bar Styles */
.recommendation-bar { margin: 1.5rem auto; }
.rec-wrapper { display: flex; align-items: center; gap: 1rem; position: relative; }
.rec-head { 
  background: #1e1e1e; color: white; display: flex; align-items: center; gap: 1rem; 
  padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: 700; white-space: nowrap;
}
.heart { color: #f43f5e; font-size: 1.2rem; }
.rec-scroll { 
  display: flex; gap: 1rem; overflow-x: auto; scrollbar-width: none; padding: 0.5rem 0;
  -ms-overflow-style: none; flex: 1;
}
.rec-scroll::-webkit-scrollbar { display: none; }
.rec-item { 
  background: #f1f5f9; border: none; display: flex; align-items: center; gap: 0.75rem; 
  padding: 0.5rem 1.25rem; border-radius: 50px; white-space: nowrap; transition: 0.2s;
}
.rec-item:hover { background: #e2e8f0; transform: translateY(-2px); }
.rec-item img { width: 24px; height: 24px; object-fit: contain; }
.rec-item span { font-size: 0.9rem; font-weight: 600; color: #334155; }
.rec-next { 
   background: white; border-radius: 50%; width: 32px; height: 32px; 
   display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);
   cursor: pointer; font-size: 1.5rem; color: #64748b;
}

/* Flash Deal Hero */
.deal-hero { background: #fff; padding: 4rem 0; border-bottom: 2px solid #f1f5f9; }
.deal-inner { display: grid; grid-template-columns: 1fr 400px; gap: 4rem; align-items: center; }
.deal-badge { background: #fef2f2; color: #ef4444; font-weight: 800; font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: 4px; display: inline-block; margin-bottom: 1.5rem; }
.title-lg { font-size: 3.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; color: #0f172a; }
.highlight { color: var(--primary); }
.deal-content p { font-size: 1.2rem; color: #64748b; margin-bottom: 2.5rem; max-width: 500px; }
.btn-xl { padding: 1.25rem 2.5rem; font-size: 1.1rem; border-radius: 50px; }

.deal-card-main { position: relative; padding: 1.5rem; background: #fff; border: 1px solid #e2e8f0; }
.deal-tag { position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 50px; font-weight: 800; font-size: 1.1rem; z-index: 10; }
.deal-img { aspect-ratio: 1; overflow: hidden; border-radius: 1rem; margin-bottom: 1.5rem; }
.deal-img img { width: 100%; height: 100%; object-fit: cover; }
.d-brand { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 700; }
.deal-info h3 { font-size: 1.5rem; font-weight: 800; margin: 0.5rem 0 1rem; color: #0f172a; }
.d-prices { margin-bottom: 1.5rem; }
.curr { font-size: 2.5rem; font-weight: 900; color: #ef4444; margin-right: 0.75rem; }
.old { font-size: 1.2rem; text-decoration: line-through; color: #94a3b8; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.view-all { font-weight: 700; color: var(--primary); }

.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 2rem; }
.category-card { text-align: center; text-decoration: none; }
.cat-img { width: 100%; aspect-ratio: 1; background: #f8fafc; border-radius: 50%; overflow: hidden; margin-bottom: 1rem; border: 1px solid #e2e8f0; }
.cat-img img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
.category-card:hover img { transform: scale(1.1); }
.category-card h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; }

.bg-light { background: #f8fafc; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.product-card { padding: 0; overflow: hidden; }
.product-img { width: 100%; aspect-ratio: 1; overflow: hidden; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 1.5rem; }
.product-brand { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.product-name { font-weight: 700; font-size: 1.1rem; margin: 0.5rem 0 1.25rem; display: block; color: #1e293b; }
.price-row { display: flex; justify-content: space-between; align-items: center; }
.sale-price { color: var(--primary); font-weight: 900; font-size: 1.4rem; }
.old-price { text-decoration: line-through; color: #94a3b8; font-size: 1rem; margin-left: 0.5rem; }
.btn-add-cart { background: #0f172a; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; }

.support-banner { background: #1e293b; color: white; padding: 4rem; display: flex; align-items: center; justify-content: space-between; border-radius: 2rem; border: none; }
.support-content h2 { color: white; margin-bottom: 1rem; }
.support-content p { color: #94a3b8; font-size: 1.2rem; margin-bottom: 2rem; max-width: 500px; }
.support-icon { font-size: 6rem; opacity: 0.2; }

.hover-lift { transition: 0.3s; }

.hover-lift:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
.w-full { width: 100%; }

@media (max-width: 968px) {
  .deal-inner { grid-template-columns: 1fr; text-align: center; gap: 2rem; }
  .deal-content p { margin: 2rem auto; }
  .title-lg { font-size: 2.5rem; }
}
</style>

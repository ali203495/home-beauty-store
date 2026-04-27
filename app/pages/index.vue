<script setup lang="ts">
// 1. Concurrent SSR Data Fetching
const { data: categories } = await useFetch('/api/categories')
const { data: flashDeals } = await useFetch('/api/deals')
const { data: recommended } = await useFetch('/api/tracking/recommended')

useSeoMeta({
  title: 'EL-WALI SHOP | Premium Warehouse Marrakech',
  description: 'Shop high-quality beauty and home products from Marrakech. Fast local delivery, best prices, and authentic quality.'
})
</script>

<template>
  <div class="home-page">
    <!-- HERO: Conversion Focused -->
    <section class="hero section-padding">
       <div class="container hero-grid">
          <div class="hero-content fade-in-up">
             <div class="tagline">Exclusive Selection</div>
             <h1 class="display-title">Elevate Your Lifestyle in Marrakech</h1>
             <p class="subtitle">Discover premium beauty and home essentials curated for the modern Moroccan household. Delivered directly from our warehouse to your door.</p>
             <div class="hero-actions">
                <AppButton to="/products" variant="primary">Shop Catalog</AppButton>
                <AppButton to="/about" variant="outline">Learn More</AppButton>
             </div>
          </div>
          <div class="hero-visual desktop-only">
             <div class="visual-stack">
                <div class="visual-card card fade-in-up">✨ Authentic Quality</div>
                <div class="visual-card card fade-in-up" style="animation-delay: 0.2s">🚚 Fast Delivery</div>
             </div>
          </div>
       </div>
    </section>

    <!-- CATEGORIES: Discovery -->
    <section class="categories-section container">
       <div class="section-header">
          <h2 class="title-md">Browse by Category</h2>
          <NuxtLink to="/products" class="link-more">View All →</NuxtLink>
       </div>
       <div class="categories-grid">
          <NuxtLink 
            v-for="cat in categories" 
            :key="cat.id" 
            :to="`/categories/${cat.slug}`"
            class="cat-card card hover-scale"
          >
             <div class="cat-icon">📂</div>
             <h3>{{ cat.name }}</h3>
             <span>{{ cat.description }}</span>
          </NuxtLink>
       </div>
    </section>

    <!-- FLASH DEALS: Real-time Pressure -->
    <section class="deals-section section-padding">
       <div class="container">
          <div class="section-header white">
             <div>
                <span class="badge-flash">Limited Time</span>
                <h2 class="title-md">Today's Flash Deals</h2>
             </div>
             <div class="countdown">Ends in: <strong>04:22:15</strong></div>
          </div>
          <div class="products-grid">
             <ProductCard 
               v-for="product in flashDeals" 
               :key="product.id" 
               :product="product" 
             />
          </div>
       </div>
    </section>

    <!-- RECOMMENDED: Personalization -->
    <section class="recommended-section container section-padding">
       <div class="section-header">
          <h2 class="title-md">Recommended For You</h2>
       </div>
       <div class="products-grid">
          <ProductCard 
            v-for="product in recommended" 
            :key="product.id" 
            :product="product" 
          />
       </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: var(--secondary);
  color: white;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  align-items: center;
}

.display-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  margin: 1rem 0 2rem;
}

.tagline {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 500px;
  margin-bottom: 3rem;
}

.hero-actions { display: flex; gap: 1rem; }

.visual-stack { display: flex; flex-direction: column; gap: 2rem; }
.visual-card { 
  background: rgba(255,255,255,0.05); 
  backdrop-filter: blur(10px);
  padding: 2rem;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.section-header.white { color: var(--text-dark); }
.badge-flash { background: var(--primary); color: white; padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 800; border-radius: 4px; }

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.cat-card h3 { margin: 0.5rem 0; }
.cat-card span { font-size: 0.85rem; color: var(--text-muted); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

@media (max-width: 800px) {
  .hero-grid { grid-template-columns: 1fr; }
  .display-title { font-size: 2.5rem; }
}
</style>

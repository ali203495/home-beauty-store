<script setup lang="ts">
const { data: categories } = await useFetch('/api/categories')
const { data: featuredProducts } = await useFetch('/api/products?featured=true')
</script>

<template>
  <div class="homepage">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <span class="badge">Mega Deals ⚡</span>
          <h1 class="title-lg">Everything You Need, <br/> Delivered to You.</h1>
          <p>Discover appliances, kitchenware, cosmetics, and more at the best prices.</p>
          <NuxtLink to="/products" class="btn btn-primary">Shop All Products</NuxtLink>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800" alt="Megastore Hero" />
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="section-padding container">
      <div class="section-header">
        <h2 class="title-md">Browse by Category</h2>
        <NuxtLink to="/categories" class="view-all">View All →</NuxtLink>
      </div>
      <div class="categories-grid">
        <NuxtLink 
          v-for="cat in categories" 
          :key="cat.slug" 
          :to="`/categories/${cat.slug}`" 
          class="category-card"
        >
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
          <h2 class="title-md">Featured Best Sellers</h2>
          <NuxtLink to="/products" class="view-all">Shop All →</NuxtLink>
        </div>
        <div class="products-grid">
          <div v-for="product in featuredProducts" :key="product.id" class="product-card card">
             <div class="product-img">
                <img :src="JSON.parse(product.images)[0]" :alt="product.name">
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
  </div>
</template>

<style scoped>
.hero {
  background: white;
  padding: 6rem 0;
  border-bottom: 1px solid var(--border);
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.hero-content { flex: 1; }
.hero-image { flex: 1; border-radius: 2rem; overflow: hidden; box-shadow: var(--shadow-lg); }
.hero-image img { width: 100%; display: block; }

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(230, 49, 0, 0.1);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin: 1.5rem 0 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.view-all {
  color: var(--primary);
  font-weight: 700;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.category-card {
  text-align: center;
}

.cat-img {
  width: 100%;
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border);
}

.cat-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.category-card:hover img { transform: scale(1.1); }
.category-card h3 { font-size: 1rem; margin: 0; }

.bg-light { background: var(--bg-main); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.product-card {
  padding: 0;
  overflow: hidden;
}

.product-img {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-img img { width: 100%; height: 100%; object-fit: cover; }

.product-info {
  padding: 1rem;
}

.product-brand {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.product-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  display: block;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prices { display: flex; gap: 0.5rem; align-items: baseline; }
.sale-price { color: var(--primary); font-weight: 800; font-size: 1.2rem; }
.old-price { text-decoration: line-through; color: var(--text-muted); font-size: 0.9rem; }

.btn-add-cart {
  background: var(--secondary);
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-inner { flex-direction: column; text-align: center; gap: 2rem; }
  .title-lg { font-size: 1.8rem; }
}
</style>

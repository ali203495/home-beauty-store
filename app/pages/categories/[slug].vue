<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

const { data: category } = await useFetch(`/api/categories/${slug}`)

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

const { data: products } = await useFetch('/api/products', {
  query: { category: category.value.id }
})

useSeoMeta({
  title: `${category.value.name} | EL-WALI SHOP`,
  description: category.value.description || `Browse the best products in ${category.value.name}`
})
</script>

<template>
  <div class="category-page container section-padding">
    <div class="category-header fade-in-up">
       <div class="header-content">
          <h1 class="title-lg">{{ category.name }}</h1>
          <p v-if="category.description">{{ category.description }}</p>
       </div>
       <div v-if="category.image" class="header-image">
          <img :src="category.image" :alt="category.name" />
       </div>
    </div>

    <div class="catalog-section section-padding">
       <div v-if="products?.length" class="catalog-grid">
           <div v-for="product in products" :key="product.id" class="product-card card hover-lift">
              <NuxtLink :to="`/products/${product.slug}`" class="product-img">
                 <img :src="JSON.parse(product.images || '[]')[0]" :alt="product.name">
              </NuxtLink>
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
        <div v-else class="empty-state card">
           <h2>No products in this category yet</h2>
           <p>Check back soon as we update our generalist catalog!</p>
           <NuxtLink to="/products" class="btn btn-primary">Browse All Products</NuxtLink>
        </div>
    </div>
  </div>
</template>

<style scoped>
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-main);
  padding: 4rem;
  border-radius: var(--radius);
  gap: 4rem;
}

.header-content { flex: 1; }
.header-content p { font-size: 1.2rem; color: var(--text-muted); margin-top: 1rem; line-height: 1.6; }

.header-image { flex: 1; max-width: 400px; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); }
.header-image img { width: 100%; display: block; }

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .category-header { flex-direction: column; text-align: center; padding: 2rem; }
}
</style>

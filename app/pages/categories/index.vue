<script setup lang="ts">
const { data: categories } = await useFetch('/api/categories?rootOnly=true')

useSeoMeta({
  title: 'All Categories | EL-WALI SHOP',
  description: 'Explore our wide range of departments from Kitchenware to Beauty.'
})
</script>

<template>
  <div class="categories-index container section-padding">
    <div class="section-header">
       <h1 class="title-md">Explore All Departments</h1>
       <p class="text-muted">Find exactly what you need in our generalist megastore.</p>
    </div>

    <div class="categories-grid section-padding">
       <NuxtLink 
          v-for="cat in categories" 
          :key="cat.slug" 
          :to="`/categories/${cat.slug}`" 
          class="category-main-card card hover-scale"
        >
          <div class="cat-hero-img">
             <img :src="cat.image || 'https://via.placeholder.com/400'" :alt="cat.name" />
          </div>
          <div class="cat-footer">
             <h2>{{ cat.name }}</h2>
             <span>Browse Products →</span>
          </div>
        </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.section-header { text-align: center; }

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.category-main-card { padding: 0; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
.cat-hero-img { width: 100%; height: 250px; overflow: hidden; }
.cat-hero-img img { width: 100%; height: 100%; object-fit: cover; }

.cat-footer { padding: 1.5rem; text-align: center; }
.cat-footer h2 { margin-bottom: 0.5rem; color: var(--secondary); }
.cat-footer span { font-size: 0.9rem; font-weight: 700; color: var(--primary); }
</style>

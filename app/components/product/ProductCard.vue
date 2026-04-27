<script setup lang="ts">
const props = defineProps<{
  product: any
  loading?: boolean
}>()

const cartStore = useCartStore()
const images = computed(() => JSON.parse(props.product?.images || '[]'))
const mainImage = computed(() => images.value[0] || 'https://via.placeholder.com/400')

const isAdding = ref(false)
const handleAddToCart = () => {
  isAdding.value = true
  cartStore.addItem(props.product)
  setTimeout(() => isAdding.value = false, 800)
}
</script>

<template>
  <div class="product-card card hover-scale" :class="{ 'is-loading': loading }">
    <NuxtLink :to="`/products/${product.slug}`" class="image-wrapper">
       <div class="image-inner">
          <NuxtImg 
            :src="mainImage" 
            :alt="product.name" 
            width="400" 
            height="400" 
            format="webp" 
            loading="lazy"
            class="product-image"
          />
       </div>
       <div v-if="product.salePrice" class="badge-sale">Sale</div>
    </NuxtLink>

    <div class="product-info">
       <div class="category">{{ product.category?.name || 'General' }}</div>
       <NuxtLink :to="`/products/${product.slug}`" class="name">{{ product.name }}</NuxtLink>
       
       <div class="price-row">
          <div class="prices">
             <span v-if="product.salePrice" class="sale-price">${{ product.salePrice }}</span>
             <span :class="{ 'old-price': product.salePrice }">${{ product.price }}</span>
          </div>
          <button 
            class="btn-add" 
            @click.stop="handleAddToCart"
            :class="{ 'is-active': isAdding }"
            aria-label="Add to cart"
          >
             <span v-if="!isAdding">+</span>
             <span v-else>✓</span>
          </button>
       </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f8f8;
  /* PRODUCTION: Prevent shift during image load */
  contain: paint;
}

.image-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-dark);
  line-height: 1.2;
}

.price-row {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prices {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.sale-price {
  color: var(--primary);
  font-weight: 800;
}

.old-price {
  text-decoration: line-through;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.btn-add {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--text-dark);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-add.is-active {
  background: #10b981;
  transform: scale(1.2);
}

.badge-sale {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}
</style>

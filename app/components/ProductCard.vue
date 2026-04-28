<script setup lang="ts">
const props = defineProps<{
  product: any;
}>();

const images = computed(() => JSON.parse(props.product.images || '[]'));
const mainImage = computed(() => images.value[0] || 'https://via.placeholder.com/400');
</script>

<template>
  <div class="group flex flex-col h-full bg-white animate-luxury-fade">
    <NuxtLink :to="`/products/${product.slug}`" class="relative aspect-[4/5] overflow-hidden bg-luxury-cream">
      <!-- Main Image -->
      <NuxtImg 
        :src="mainImage" 
        class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
        loading="lazy"
        width="400"
        height="500"
      />
      <!-- Hover Image -->
      <NuxtImg 
        :src="images[1] || mainImage" 
        class="absolute inset-0 w-full h-full object-cover scale-110 opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
        loading="lazy"
        width="400"
        height="500"
      />
      
      <!-- Quick Badges -->
      <div v-if="product.salePrice" class="absolute top-2 left-2 bg-luxury-gold text-white text-[10px] font-bold px-2 py-1 uppercase z-10">
        Offre Spéciale
      </div>
      
      <div v-if="product.stock < 5 && product.stock > 0" class="absolute bottom-2 left-2 bg-white/90 text-red-600 text-[10px] font-bold px-2 py-1 uppercase z-10">
        Derniers Exemplaires
      </div>
    </NuxtLink>

    <div class="pt-4 flex flex-col flex-grow">
      <div class="flex justify-between items-start">
        <h3 class="text-xs font-bold uppercase tracking-wider text-luxury-black line-clamp-1">
          <NuxtLink :to="`/products/${product.slug}`">{{ product.name }}</NuxtLink>
        </h3>
      </div>
      
      <p class="text-[10px] text-luxury-muted uppercase mt-1 tracking-widest">
        {{ product.category?.name || 'Collection Luxury' }}
      </p>

      <div class="mt-auto pt-4 flex flex-col gap-3">
        <div class="flex items-baseline gap-2">
          <span class="text-sm font-black">{{ product.salePrice || product.price }} MAD</span>
          <span v-if="product.salePrice" class="text-xs text-luxury-muted line-through">{{ product.price }} MAD</span>
        </div>
        
        <AddToCartButton :productId="product.id" />
      </div>
    </div>
  </div>
</template>

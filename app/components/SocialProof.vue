<script setup lang="ts">
const props = defineProps<{
  productId: number;
}>();

const { data } = await useFetch(`/api/products/social-proof`, {
  query: { productId: props.productId },
  lazy: true,
  server: false
});
</script>

<template>
  <div v-if="data" class="flex flex-col gap-1 my-4">
    <div v-if="data.isHot" class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-red-600 bg-red-50 w-fit px-2 py-0.5 animate-pulse">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span>En vue par {{ data.popularity }} personnes</span>
    </div>
    
    <div v-if="data.recentlyBought > 0" class="text-xs text-luxury-muted flex items-center gap-1 font-medium italic">
      <span class="i-heroicons-shopping-bag" />
      Commandé {{ data.recentlyBought }} fois ces dernières 24h
    </div>
  </div>
</template>

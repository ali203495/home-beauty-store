<script setup lang="ts">
const props = defineProps<{
  productId: number;
  loading?: boolean;
}>();

const cartStore = useCartStore();
const added = ref(false);

const handleAdd = async () => {
  added.value = true;
  await cartStore.addItem(props.productId);
  setTimeout(() => added.value = false, 2000);
};
</script>

<template>
  <button 
    @click="handleAdd"
    :disabled="loading"
    class="btn-primary w-full relative overflow-hidden group flex items-center justify-center gap-2"
  >
    <transition name="fade-slide">
      <span v-if="!added" class="flex items-center gap-2">
        <span class="text-xs">Ajouter au Panier</span>
      </span>
      <span v-else class="flex items-center gap-2">
        <span class="i-heroicons-check-circle" />
        <span class="text-xs">Ajouté ✓</span>
      </span>
    </transition>
  </button>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>

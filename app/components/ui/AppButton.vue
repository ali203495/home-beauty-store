<script setup lang="ts">
defineProps<{
  to?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    class="app-btn"
    :class="[`is-${variant || 'primary'}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <slot />
  </component>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.is-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(230, 49, 0, 0.39);
}

.is-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 49, 0, 0.23);
}

.is-outline {
  background: transparent;
  border-color: var(--border);
  color: var(--text-dark);
}

.is-outline:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.is-loading {
  color: transparent;
  pointer-events: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  position: absolute;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

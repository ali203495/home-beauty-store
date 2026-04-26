<script setup lang="ts">
import '~/assets/css/main.css'
import Header from '~/components/layout/Header.vue'
</script>

<template>
  <div class="layout-wrapper">
    <Header />
    <main>
      <NuxtPage />
    </main>
    <!-- Future Footer goes here -->
  </div>
</template>

<style>
/* Global resets if needed */
</style>

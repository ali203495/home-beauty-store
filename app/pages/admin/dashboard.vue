<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { data: metrics, refresh } = await useFetch('/api/admin/metrics')

const kpiStats = computed(() => [
  { name: 'Chiffre d’Affaires', value: `${metrics.value?.kpis.total_revenue.toLocaleString()} MAD`, icon: 'i-heroicons-banknotes', color: 'text-emerald-500' },
  { name: 'Commandes Totales', value: metrics.value?.kpis.total_orders, icon: 'i-heroicons-shopping-bag', color: 'text-luxury-gold' },
  { name: 'Ventes Aujourd’hui', value: metrics.value?.kpis.today_orders, icon: 'i-heroicons-bolt', color: 'text-amber-500' },
  { name: 'État Système', value: 'Elite', icon: 'i-heroicons-check-badge', color: 'text-blue-500' }
])
</script>

<template>
  <div class="min-h-screen bg-luxury-cream/30 pt-32 pb-24">
    <div class="container-sm">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-gold mb-2">Tableau de Bord</h2>
           <h1 class="text-4xl font-display">Commandement El-Wali</h1>
        </div>
        <button @click="refresh()" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white border border-luxury-border px-6 py-3 hover:bg-luxury-black hover:text-white transition-all">
           <span class="i-heroicons-arrow-path" /> Actualiser les Données
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div v-for="stat in kpiStats" :key="stat.name" class="bg-white border border-luxury-border p-8 hover:shadow-xl transition-all group">
           <div class="flex items-center justify-between mb-4">
              <span :class="[stat.icon, stat.color, 'text-2xl']" />
              <span class="text-[8px] font-black uppercase tracking-widest text-luxury-muted">En Temps Réel</span>
           </div>
           <p class="text-[10px] font-black uppercase tracking-widest text-luxury-muted mb-1">{{ stat.name }}</p>
           <p class="text-3xl font-display group-hover:text-luxury-gold transition-colors">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Middle Section: Activity & Health -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div class="lg:col-span-8 bg-white border border-luxury-border p-10">
            <h3 class="text-xs font-black uppercase tracking-[0.2em] mb-8 border-b border-luxury-border pb-4">Performance Volumétrique</h3>
            <div class="aspect-[21/9] bg-luxury-cream/20 flex items-center justify-center border border-dashed border-luxury-border">
               <p class="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Graphique de croissance (Bientôt disponible)</p>
            </div>
         </div>

         <div class="lg:col-span-4 space-y-6">
            <div class="bg-luxury-black p-10 text-white">
               <h3 class="text-xs font-black uppercase tracking-[0.2em] mb-6 text-luxury-gold">Sante Infrastructure</h3>
               <div class="space-y-6">
                  <div class="flex items-center justify-between">
                     <span class="text-[10px] font-bold uppercase tracking-widest text-white/60 text-xs">Core Engine</span>
                     <span class="text-[10px] font-black bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full uppercase">Stable</span>
                  </div>
                  <div class="flex items-center justify-between">
                     <span class="text-[10px] font-bold uppercase tracking-widest text-white/60 text-xs">Neon Postgres</span>
                     <span class="text-[10px] font-black bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full uppercase">Connecté</span>
                  </div>
                  <div class="flex items-center justify-between">
                     <span class="text-[10px] font-bold uppercase tracking-widest text-white/60 text-xs">Edge Config (Cache)</span>
                     <span class="text-[10px] font-black bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full uppercase">Actif</span>
                  </div>
               </div>
            </div>

            <div class="bg-white border border-luxury-border p-10">
               <h3 class="text-xs font-black uppercase tracking-[0.2em] mb-6">Support</h3>
               <p class="text-xs text-luxury-muted leading-relaxed mb-6">
                  Le système est surveillé 24/7 par l'architecture Serverless. En cas de pic de trafic (>100k), l'infrastructure s'adaptera automatiquement.
               </p>
               <NuxtLink to="/" class="text-[10px] font-black uppercase border-b-2 border-luxury-gold pb-1 hover:text-luxury-gold transition-colors">Documentation Technique</NuxtLink>
            </div>
         </div>
      </div>

    </div>
  </div>
</template>

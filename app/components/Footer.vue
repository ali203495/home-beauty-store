<template>
  <footer class="bg-luxury-black text-white pt-24 pb-12">
    <div class="container-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        <!-- Brand Info -->
        <div class="space-y-6">
          <NuxtLink to="/" class="flex flex-col group">
            <span class="text-2xl font-display tracking-[0.2em] uppercase text-white group-hover:text-luxury-gold transition-colors">EL-WALI</span>
            <span class="text-[8px] uppercase tracking-[0.5em] text-luxury-gold">Luxury Beauty</span>
          </NuxtLink>
          <p class="text-[11px] text-white/50 leading-relaxed font-light uppercase tracking-widest">
            Votre destination d'exception pour la beauté et le soin. Une sélection exclusive des meilleures marques internationales.
          </p>
          <div class="flex gap-4">
             <a href="#" class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-luxury-gold transition-colors">
                <span class="i-heroicons-globe-alt text-sm" />
             </a>
             <a href="#" class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-luxury-gold transition-colors">
                <span class="i-heroicons-camera text-sm" />
             </a>
          </div>
        </div>

        <!-- Links -->
        <div v-for="(links, title) in footerNavigation" :key="title">
          <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-8">{{ title }}</h3>
          <ul class="space-y-4">
            <li v-for="link in links" :key="link.name">
              <NuxtLink :to="link.to" class="text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-8">Newsletter</h3>
          <p class="text-[11px] text-white/50 mb-6 uppercase tracking-widest">Rejoignez le cercle EL-WALI pour des offres exclusives.</p>
          <div class="flex gap-2">
            <input type="email" placeholder="E-mail" class="bg-white/5 border border-white/10 px-4 py-3 text-xs w-full focus:border-luxury-gold outline-none" />
            <button class="bg-white text-luxury-black px-4 py-2 hover:bg-luxury-gold hover:text-white transition-all">
              <span class="i-heroicons-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      <!-- Legal -->
      <div class="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[9px] uppercase tracking-widest text-white/30">© 2025 EL-WALI LUXURY BEAUTY. Tous droits réservés.</p>
        <div class="flex gap-8">
          <NuxtLink to="/legal" class="text-[9px] uppercase tracking-widest text-white/30 hover:text-white">Mentions Légales</NuxtLink>
          <NuxtLink to="/privacy" class="text-[9px] uppercase tracking-widest text-white/30 hover:text-white">Confidentialité</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const footerNavigation = {
  'Boutique': [
    { name: 'Nouveautés', to: '/products' },
    { name: 'Meilleures Ventes', to: '/products' },
    { name: 'Maquillage', to: '/products' },
    { name: 'Soins', to: '/products' }
  ],
  'Aide': [
    { name: 'Suivi de commande', to: '/tracking' },
    { name: 'Livraison & Retours', to: '/shipping' },
    { name: 'FAQ', to: '/faq' },
    { name: 'Contact', to: '/contact' }
  ]
}
</script>

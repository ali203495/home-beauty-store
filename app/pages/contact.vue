<script setup lang="ts">
const { data: settings } = await useFetch('/api/settings')
const { user, loggedIn } = useUserSession()

useSeoMeta({
  title: 'Contact Us | EL-WALI SHOP Marrakech',
  description: 'Get in touch with the EL-WALI warehouse in Marrakech. Check our location, hours, and shipping policies.'
})
</script>

<template>
  <div class="contact-page container section-padding fade-in-up">
    <div class="contact-layout">
       <div class="contact-info-section">
          <h1 class="title-lg">
             <template v-if="loggedIn">Hello, {{ user?.name?.split(' ')[0] }}!</template>
             <template v-else>Get in Touch</template>
          </h1>
          <p class="subtitle">Our central warehouse is located in the heart of Marrakech. We pride ourselves on local delivery excellence.</p>

          <div class="info-grid card">
             <div class="info-block">
                <span class="icon">📍</span>
                <div>
                   <label>Warehouse Address</label>
                   <p>{{ settings?.contact_address || 'Sidi Youssef Ben Ali, Marrakech' }}</p>
                </div>
             </div>
             
             <div class="info-block">
                <span class="icon">📞</span>
                <div>
                   <label>Customer Support</label>
                   <p>{{ settings?.contact_phone || '+212 000-000000' }}</p>
                </div>
             </div>

             <div class="info-block">
                <span class="icon">✉️</span>
                <div>
                   <label>Business Email</label>
                   <p>{{ settings?.contact_email || 'contact@el-wali.com' }}</p>
                </div>
             </div>

             <div class="info-block">
                <span class="icon">⏰</span>
                <div>
                   <label>Working Hours</label>
                   <p>{{ settings?.work_hours || 'Mon-Sat: 09:00 - 20:00' }}</p>
                </div>
             </div>
          </div>

          <div class="shipping-warning card">
             <span class="warning-icon">🚚</span>
             <div class="warning-text">
                <h3>Regional Restriction</h3>
                <p>{{ settings?.shipping_restriction || 'Please note: We currently only ship within the Marrakech city limits.' }}</p>
             </div>
          </div>
       </div>

       <div class="contact-form-section card">
          <h2>Send us a message</h2>
          <form class="contact-form">
             <div class="form-row">
                <div class="input-group">
                   <label>Your Name</label>
                   <input type="text" placeholder="John Doe" />
                </div>
                <div class="input-group">
                   <label>Phone Number</label>
                   <input type="text" placeholder="+212..." />
                </div>
             </div>
             <div class="input-group">
                <label>Subject</label>
                <input type="text" placeholder="Inquiry about..." />
             </div>
             <div class="input-group">
                <label>Message</label>
                <textarea rows="5" placeholder="How can we help you?"></textarea>
             </div>
             <button type="submit" class="btn btn-primary w-full">Send Message</button>
          </form>
       </div>
    </div>
  </div>
</template>

<style scoped>
.contact-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }

.subtitle { font-size: 1.2rem; color: var(--text-muted); margin: 1.5rem 0 3rem; line-height: 1.6; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem; border: 1px solid var(--border); }
.info-block { display: flex; gap: 1rem; align-items: flex-start; }
.icon { font-size: 1.5rem; background: #f1f5f9; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
.info-block label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.25rem; }
.info-block p { font-weight: 600; color: var(--secondary); }

.shipping-warning { margin-top: 2rem; background: #fff1f2; border: 2px dashed #fda4af; padding: 2rem; display: flex; gap: 1.5rem; align-items: center; }
.warning-icon { font-size: 2.5rem; }
.warning-text h3 { margin-bottom: 0.25rem; color: #e11d48; }

.contact-form-section { padding: 3rem; border: none; box-shadow: var(--shadow-lg); }
.contact-form-section h2 { margin-bottom: 2rem; }
.contact-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; }
.input-group input, .input-group textarea { width: 100%; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; transition: 0.2s; }
.input-group input:focus, .input-group textarea:focus { border-color: var(--primary); }

.w-full { width: 100%; border-radius: 50px; padding: 1.25rem; }

@media (max-width: 968px) {
  .contact-layout { grid-template-columns: 1fr; gap: 2rem; }
}
</style>

<script setup lang="ts">
const { cart, removeFromCart, updateQuantity, subtotal, clearCart } = useCart()
const { user, loggedIn } = useUserSession()
const { data: settings } = await useFetch('/api/settings')

const loading = ref(false)
const orderStatus = ref<'idle' | 'success'>('idle')
const lastOrder = ref<any>(null)
const whatsappStatus = ref<'idle' | 'clicked'>('idle')
const { generateMessage, getWhatsAppUrl } = useWhatsAppOrder()

const checkoutForm = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  phone: '',
  address: ''
})

const handleCheckout = async () => {
  if (!cart.value.length) return
  
  loading.value = true
  try {
     const orderData = {
        customerName: checkoutForm.value.name,
        customerEmail: checkoutForm.value.email,
        customerPhone: checkoutForm.value.phone,
        shippingAddress: checkoutForm.value.address,
        totalAmount: subtotal.value,
        items: cart.value.map(i => ({
           productId: i.id,
           quantity: i.quantity,
           priceAtTime: i.price
        }))
     }

     const res: any = await $fetch('/api/orders', {
        method: 'POST',
        body: orderData
     })

     lastOrder.value = res.order
     orderStatus.value = 'success'
     clearCart()
  } catch (e: any) {
     alert('Error placing order: ' + (e.data?.statusMessage || 'Please check your information'))
  } finally {
     loading.value = false
  }
}
const getWhatsAppDetails = (): any => ({
  id: lastOrder.value.id,
  name: lastOrder.value.customerName,
  phone: lastOrder.value.customerPhone,
  address: lastOrder.value.shippingAddress,
  total: Number(lastOrder.value.totalAmount),
  items: lastOrder.value.items.map((i: any) => ({
    name: i.name || 'Product',
    quantity: i.quantity
  }))
})

const handleWhatsAppClick = async () => {
  if (!lastOrder.value) return
  
  loading.value = true
  try {
     // 1. Track click in backend (Security + Real world stats)
     await $fetch(`/api/orders/${lastOrder.value.id}/whatsapp-click`, { method: 'PATCH' })
     
     // 2. State update for feedback
     whatsappStatus.value = 'clicked'

     // 3. Open WhatsApp
     const url = getWhatsAppUrl(getWhatsAppDetails())
     window.open(url, '_blank')
  } finally {
     loading.value = false
  }
}
</script>

<template>
  <div class="cart-page container section-padding fade-in-up">
    <div v-if="orderStatus === 'success'" class="success-screen card">
       <div class="success-icon">🎉</div>
       <h1>Order Received!</h1>
       <p class="mb-2">Thank you, <strong>{{ checkoutForm.name }}</strong>. Jina n2akdo m3ak ttalab f Marrakech.</p>
       
       <div v-if="lastOrder" class="whatsapp-preview-box mb-2">
          <div class="preview-header">Message Preview (Darija)</div>
          <pre class="preview-content">{{ generateMessage(getWhatsAppDetails()) }}</pre>
       </div>

       <div v-if="whatsappStatus === 'clicked'" class="whatsapp-feedback mb-2">
          ✅ WhatsApp opened! Please <strong>SEND</strong> the message to finalize your order.
       </div>

       <div class="success-actions">
          <button @click="handleWhatsAppClick" class="btn btn-whatsapp mb-1" :disabled="loading">
             <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
             Confirm via WhatsApp
          </button>
          <NuxtLink to="/products" class="btn btn-outline w-full">Continue Shopping</NuxtLink>
       </div>
    </div>

    <template v-else>
      <h1 class="title-lg mb-2">My Shopping Cart</h1>

      <div class="cart-layout" v-if="cart.length">
        <!-- Cart Items -->
        <div class="cart-items">
           <div v-for="item in cart" :key="item.id" class="cart-item card">
              <img :src="item.image" :alt="item.name" class="item-thumb" />
              <div class="item-details">
                 <h3>{{ item.name }}</h3>
                 <span class="item-price-unit">${{ item.price }}</span>
              </div>
              <div class="item-qty">
                 <button @click="updateQuantity(item.id, item.quantity - 1)">-</button>
                 <span>{{ item.quantity }}</span>
                 <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
              </div>
              <div class="item-total">
                 ${{ (item.price * item.quantity).toFixed(2) }}
              </div>
              <button class="btn-remove" @click="removeFromCart(item.id)">✕</button>
           </div>
           
           <div class="cart-actions mt-1">
              <NuxtLink to="/products" class="view-all">← Back to Shopping</NuxtLink>
              <button class="btn-text" @click="clearCart">Clear Cart</button>
           </div>
        </div>

        <!-- Checkout Sidebar -->
        <aside class="checkout-sidebar">
           <div class="checkout-card card">
              <div v-if="settings?.shipping_restriction" class="marrakech-badge mb-1">
                 {{ settings.shipping_restriction }}
              </div>
              
              <h2 class="title-md">Order Summary</h2>
              <div class="summary-line">
                 <span>Subtotal</span>
                 <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="summary-line">
                 <span>Shipping (Marrakech)</span>
                 <span class="free">FREE</span>
              </div>
              <div class="summary-line total">
                 <span>Order Total</span>
                 <span>${{ subtotal.toFixed(2) }}</span>
              </div>

              <form @submit.prevent="handleCheckout" class="checkout-form mt-2">
                 <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" v-model="checkoutForm.name" required />
                 </div>
                 <div class="input-group">
                    <label>Phone Number (WhatsApp)</label>
                    <input type="text" v-model="checkoutForm.phone" required placeholder="+212 ..." />
                 </div>
                 <div class="input-group">
                    <label>Marrakech Delivery Address</label>
                    <textarea v-model="checkoutForm.address" required placeholder="Street, District, Apartment..."></textarea>
                 </div>
                 <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                    {{ loading ? 'Processing...' : 'Place Order (Cash on Delivery)' }}
                 </button>
              </form>
           </div>
        </aside>
      </div>

      <div v-else class="empty-cart card">
         <span class="icon">🛒</span>
         <h2>Your cart is empty</h2>
         <p>Looks like you haven't added anything yet.</p>
         <NuxtLink to="/products" class="btn btn-primary">Start Shopping</NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: start; }

.cart-item { display: flex; align-items: center; gap: 1.5rem; padding: 1rem; margin-bottom: 1rem; position: relative; }
.item-thumb { width: 80px; height: 80px; border-radius: var(--radius-sm); object-fit: cover; }
.item-details { flex: 1; }
.item-details h3 { font-size: 1rem; margin-bottom: 0.25rem; font-weight: 800; }
.item-price-unit { color: var(--text-muted); font-size: 0.9rem; }

.item-qty { display: flex; align-items: center; gap: 1rem; background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 50px; }
.item-qty button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--secondary); font-weight: 900; }
.item-qty span { font-weight: 800; min-width: 20px; text-align: center; }

.item-total { font-weight: 900; font-size: 1.1rem; min-width: 100px; text-align: right; color: var(--primary); }
.btn-remove { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; }

.cart-actions { display: flex; justify-content: space-between; }
.btn-text { background: none; border: none; color: #ef4444; font-weight: 700; cursor: pointer; text-decoration: underline; }

.checkout-card { padding: 2rem; position: sticky; top: 100px; }
.marrakech-badge { background: #fee2e2; color: #ef4444; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 800; text-align: center; }

.summary-line { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 600; }
.summary-line.total { border-top: 2px solid var(--border); padding-top: 1rem; margin-top: 1rem; font-size: 1.25rem; font-weight: 900; color: #1e293b; }
.free { color: #10b981; font-weight: 900; }

.checkout-form { display: flex; flex-direction: column; gap: 1.25rem; }
.checkout-form label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.4rem; color: var(--secondary); }
.checkout-form input, .checkout-form textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; }

.empty-cart, .success-screen { text-align: center; padding: 5rem 2rem; }
.empty-cart .icon, .success-icon { font-size: 5rem; margin-bottom: 1.5rem; display: block; }
.empty-cart h2 { margin-bottom: 1rem; }
.empty-cart p { color: var(--text-muted); margin-bottom: 2rem; }

.mb-2 { margin-bottom: 2rem; }
.mt-1 { margin-top: 1rem; }
.mt-2 { margin-top: 2rem; }
.w-full { width: 100%; border-radius: 50px; padding: 1.25rem; font-size: 1.1rem; }

.success-actions { max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }

.whatsapp-preview-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-sm);
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  overflow: hidden;
}
.preview-header { background: #dcfce7; padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 800; color: #166534; text-transform: uppercase; }
.preview-content { padding: 1rem; font-family: inherit; font-size: 0.9rem; white-space: pre-wrap; margin: 0; color: #1e293b; }

.whatsapp-feedback {
  background: #eff6ff;
  color: #1e40af;
  padding: 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  max-width: 400px;
  margin: 0 auto;
  border-left: 4px solid #3b82f6;
}

.btn-whatsapp { 
  display: flex; align-items: center; justify-content: center; gap: 1rem;
  background: #25D366; color: white; border: none; font-weight: 800; font-size: 1.1rem;
  padding: 1.25rem; border-radius: 50px; cursor: pointer; transition: 0.2s;
}
.btn-whatsapp:hover { background: #128C7E; transform: scale(1.02); }
.btn-whatsapp:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-whatsapp img { width: 24px; height: 24px; filter: brightness(0) invert(1); }

.btn-outline { background: none; border: 2px solid var(--border); color: var(--secondary); font-weight: 700; padding: 1rem; border-radius: 50px; }

@media (max-width: 968px) {
  .cart-layout { grid-template-columns: 1fr; }
}
</style>

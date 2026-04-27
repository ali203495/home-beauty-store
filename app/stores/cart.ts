import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  slug: string
  price: number
  image: string
  quantity: number
  stock: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    promoCode: null as string | null,
    isCartOpen: false
  }),
  
  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: (state) => state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    isEmpty: (state) => state.items.length === 0
  },
  
  actions: {
    addItem(product: any) {
      const existing = this.items.find(i => i.id === product.id)
      if (existing) {
        if (existing.quantity < product.stock) {
          existing.quantity++
        }
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: JSON.parse(product.images || '[]')[0],
          quantity: 1,
          stock: product.stock
        })
      }
      // Track Event
      useAnalytics().trackEvent('add_to_cart', { id: product.id, name: product.name })
    },
    
    removeItem(id: number) {
      this.items = this.items.filter(i => i.id !== id)
    },
    
    updateQuantity(id: number, quantity: number) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock))
      }
    },
    
    clearCart() {
      this.items = []
    }
  },
  
  persist: true
})

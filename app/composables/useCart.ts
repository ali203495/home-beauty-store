export const useCart = () => {
  const cart = useState<any[]>('cart', () => [])

  // Sync with localStorage on client
  onMounted(() => {
    const saved = localStorage.getItem('el_wali_cart')
    if (saved) {
      try {
        cart.value = JSON.parse(saved)
      } catch (e) {
        localStorage.removeItem('el_wali_cart')
      }
    }
  })

  watch(cart, (newVal) => {
    if (import.meta.client) {
      localStorage.setItem('el_wali_cart', JSON.stringify(newVal))
    }
  }, { deep: true })

  const addToCart = (product: any) => {
    const existing = cart.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: JSON.parse(product.images || '[]')[0],
        quantity: 1
      })
    }
  }

  const removeFromCart = (id: number) => {
    cart.value = cart.value.filter(i => i.id !== id)
  }

  const updateQuantity = (id: number, qty: number) => {
    const item = cart.value.find(i => i.id === id)
    if (item) {
      item.quantity = Math.max(1, qty)
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const subtotal = computed(() => {
    return cart.value.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  })

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal
  }
}

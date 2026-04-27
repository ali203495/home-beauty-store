export const useAnalytics = () => {
  const trackEvent = async (name: string, data: any) => {
    // 1. Console Log for Local Dev
    if (import.meta.dev) {
       console.log(`📊 [Analytics] ${name}:`, data)
    }

    // 2. Production: Send to Backend Event Bus
    try {
      await $fetch('/api/tracking/event', {
        method: 'POST',
        body: { type: name, data, timestamp: new Date().toISOString() }
      })
    } catch (e) {
      // Fail silently to never block UI
    }
  }

  const trackProductView = (product: any) => {
    trackEvent('product_view', { id: product.id, name: product.name, price: product.price })
  }

  return { trackEvent, trackProductView }
}

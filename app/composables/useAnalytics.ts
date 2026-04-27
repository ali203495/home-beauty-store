const eventBuffer: any[] = []
const MAX_BUFFER = 5
const RETRY_DELAY = 5000

export const useAnalytics = () => {
  const flush = async () => {
    if (eventBuffer.length === 0) return
    
    const batch = [...eventBuffer]
    eventBuffer.length = 0 // Clear buffer
    
    try {
      await $fetch('/api/tracking/batch', {
        method: 'POST',
        body: { events: batch }
      })
    } catch (e) {
      console.warn('Analytics upload failed, re-buffering...')
      eventBuffer.push(...batch) // Put back for retry
    }
  }

  const trackEvent = (name: string, data: any) => {
    eventBuffer.push({
      type: name,
      data,
      sessionId: 'sess_prod_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    })

    if (eventBuffer.length >= MAX_BUFFER) {
       // Nitro/Vercel: Use a background task if possible
       // Frontend: Use idle callback
       if (window.requestIdleCallback) {
          window.requestIdleCallback(() => flush())
       } else {
          setTimeout(flush, 1000)
       }
    }
  }

  return { trackEvent }
}

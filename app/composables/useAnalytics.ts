const eventBuffer: any[] = []
const MAX_BUFFER = 5

export const useAnalytics = () => {
  const flush = async (isClosing = false) => {
    if (eventBuffer.length === 0) return
    
    const batch = [...eventBuffer]
    eventBuffer.length = 0
    
    try {
      // PRODUCTION Hardening: Use keepalive for closing tab safety
      await fetch('/api/tracking/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: isClosing
      })
    } catch (e) {
      if (!isClosing) eventBuffer.push(...batch)
    }
  }

  // 1. PRODUCTION Hardening: Prevent data loss on exit
  if (import.meta.client) {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush(true)
    })
  }

  const trackEvent = (name: string, data: any) => {
    // 2. PRODUCTION Hardening: Persistent Session ID
    const sessionId = useCookie('elwali_session_id', { maxAge: 60 * 60 * 24 }).value || 
                     (useCookie('elwali_session_id').value = Math.random().toString(36).substr(2, 9))

    eventBuffer.push({
      type: name,
      data,
      sessionId,
      timestamp: new Date().toISOString()
    })

    if (eventBuffer.length >= MAX_BUFFER) {
       if (window.requestIdleCallback) window.requestIdleCallback(() => flush())
       else setTimeout(flush, 1000)
    }
  }

  return { trackEvent }
}

import { inngest } from './inngest'

/**
 * 🛰️ GLOBAL SERVERLESS DISPATCHER (Level 4 Resilience)
 * This replaces the BullMQ central dispatcher. 
 * Dispatches events to Inngest for guaranteed delivery and retries.
 */
export const emitEvent = async (event: string, data: any) => {
  try {
    const eventName = transformLegacyEvent(event)
    
    await inngest.send({
      name: eventName,
      data: data,
    })

    console.log(`📡 Event Dispatched: ${eventName}`)
  } catch (e) {
    console.error(`💥 Event Dispatch Failure [${event}]:`, e)
  }
}

// 🔄 COMPATIBILITY LAYER: Maps old event names to new schema
function transformLegacyEvent(event: string): any {
  const map: Record<string, string> = {
    'order.created': 'order.created',
    'product.updated': 'product.updated',
    'user.viewed': 'user.viewed'
  }
  return map[event] || event
}

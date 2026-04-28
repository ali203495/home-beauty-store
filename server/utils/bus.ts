/**
 * 🛰️ MINIMALIST DISPATCHER
 * No external queues. No complexity.
 * Lateral tasks (analytics, search) are either handled in-process
 * or picked up by Cron jobs from the Database.
 */
export const emitEvent = async (event: string, data: any) => {
  console.log(`📡 [Event] ${event}:`, JSON.stringify(data))
  
  // For 100k users, we keep this stateless. 
  // Fulfillment is triggered by the database status and Cron.
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

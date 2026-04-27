import CircuitBreaker from 'opossum'

const options = {
  timeout: 3000, // If a name takes longer than 3 seconds, fail it
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 30000 // After 30 seconds, try again
}

/**
 * BIG-TECH Resilience: Circuit Breaker for Redis
 */
export const redisBreaker = new CircuitBreaker(async (fn: Function, ...args: any[]) => {
  return await fn(...args)
}, options)

redisBreaker.fallback(() => {
  console.warn('⚠️ [Circuit Breaker] Redis is DOWN. Falling back to No-Cache mode.')
  return null
})

/**
 * BIG-TECH Resilience: Circuit Breaker for Search Engine
 */
export const searchBreaker = new CircuitBreaker(async (fn: Function, ...args: any[]) => {
  return await fn(...args)
}, options)

searchBreaker.fallback(() => {
  console.warn('⚠️ [Circuit Breaker] Search Engine is DOWN. Falling back to SQL search.')
  return null
})

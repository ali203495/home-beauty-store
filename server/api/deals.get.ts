import { db } from '../utils/db'
import { products } from '../database/schema'
import { eq, sql, inArray } from 'drizzle-orm'

// Cache this calculation for 1 hour to protect DB performance
export default defineCachedEventHandler(async (event) => {
  // 1. Get a pool of active product IDs instead of the whole table
  const pool = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.isActive, true))
    .limit(100) // Select from the latest 100 products for freshness

  if (pool.length === 0) return []

  // 2. Pick 4 random indices from the pool
  const shuffled = pool.sort(() => 0.5 - Math.random())
  const selectedIds = shuffled.slice(0, 4).map(p => p.id)

  // 3. Fetch full data for selected products
  const items = await db.query.products.findMany({
    where: inArray(products.id, selectedIds),
    with: { brand: true }
  })

  return items.map(p => {
    const originalPrice = Number(p.price)
    const cost = p.costPrice ? Number(p.costPrice) : originalPrice * 0.7
    
    // Controlled algorithmic discount
    const discountPerc = Math.floor(Math.random() * 31) + 20 
    let dealPrice = originalPrice * (1 - discountPerc / 100)
    
    if (dealPrice < cost) dealPrice = cost * 1.1

    return {
       ...p,
       dealPrice: Number(dealPrice.toFixed(2)),
       discountPercentage: Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
    }
  })
}, {
  maxAge: 60 * 60, // 1 hour server-side cache
  name: 'daily-deals'
})

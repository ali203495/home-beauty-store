import { db } from '../utils/db'
import { products } from '../database/schema'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Fetch 4 random products for the "Daily Offer"
  const items = await db.query.products.findMany({
    orderBy: [sql`RANDOM()`],
    limit: 4,
    where: (products, { eq }) => eq(products.isActive, true)
  })

  // Algorithmically apply fake deals that stay above cost price
  return items.map(p => {
    const originalPrice = Number(p.price)
    const cost = p.costPrice ? Number(p.costPrice) : originalPrice * 0.7
    
    // Random discount between 20-50%
    const discountPerc = Math.floor(Math.random() * 31) + 20 
    let dealPrice = originalPrice * (1 - discountPerc / 100)
    
    // Safety check: Don't sell below cost
    if (dealPrice < cost) {
       dealPrice = cost * 1.1 // Stay 10% above cost if discount was too aggressive
    }

    return {
       ...p,
       dealPrice: Number(dealPrice.toFixed(2)),
       discountPercentage: Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
    }
  })
})

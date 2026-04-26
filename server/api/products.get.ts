// server/api/products.get.ts
import { db } from '../utils/db'
import { products } from '../database/schema'
import { eq, and, like, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { featured, q, category } = query

  const conditions = []
  if (featured === 'true') {
    conditions.push(eq(products.isFeatured, true))
  }
  
  if (q) {
    conditions.push(
      or(
        like(products.name, `%${q}%`),
        like(products.description, `%${q}%`)
      )
    )
  }

  // Always only return active products for public API
  conditions.push(eq(products.isActive, true))

  return await db.query.products.findMany({
    where: and(...conditions),
    with: {
      brand: true,
      category: true
    }
  })
})

import { db } from '../utils/db'
import { products } from '../database/schema'
import { eq, or, and, ilike, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { category, brand, featured, search } = query

  const conditions = []

  if (category) conditions.push(eq(products.categoryId, Number(category)))
  if (brand) conditions.push(eq(products.brandId, Number(brand)))
  if (featured === 'true') conditions.push(eq(products.isFeatured, true))
  
  if (search) {
     const searchStr = String(search).trim()
     const words = searchStr.split(/\s+/).filter(w => w.length > 2)
     
     if (words.length > 0) {
        // Match ANY word in name or description (Enterprise "Better than exact" search)
        const searchConditions = words.map(word => 
           or(
             ilike(products.name, `%${word}%`),
             ilike(products.description, `%${word}%`),
             ilike(products.tags, `%${word}%`)
           )
        )
        conditions.push(and(...searchConditions))
     } else {
        // Fallback for short words
        conditions.push(or(
           ilike(products.name, `%${searchStr}%`),
           ilike(products.description, `%${searchStr}%`)
        ))
     }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  return await db.query.products.findMany({
    where,
    with: {
      category: true,
      brand: true
    },
    limit: 50
  })
})

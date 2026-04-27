import 'dotenv/config'
import { db } from '../utils/db'
import { users, categories, brands, products } from './schema'
import bcrypt from 'bcryptjs'

async function retry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries > 0) {
      console.log(`⚠️ Database busy, retrying in ${delay / 1000}s... (${retries} left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return retry(fn, retries - 1, delay * 1.5)
    }
    throw err
  }
}

async function seed() {
  console.log('Seeding database with retry logic...')

  // 1. Admin User
  await retry(async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@el-wali.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    // UPSERT style: Check before insert
    const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminEmail) })
    if (!existing) {
      await db.insert(users).values({
        name: 'Admin User',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'admin',
      })
      console.log('✅ Admin created')
    } else {
      console.log('ℹ️ Admin already exists')
    }
  })

  // 2. Categories
  const insertedCats = await retry(async () => {
    const catData = [
      { name: 'Skincare', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400' },
      { name: 'Haircare', slug: 'haircare', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400' },
      { name: 'Makeup', slug: 'makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
      { name: 'Fragrance', slug: 'fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400' },
    ]
    const current = await db.query.categories.findMany()
    if (current.length === 0) {
      return await db.insert(categories).values(catData).returning()
    }
    return current
  })
  console.log('✅ Categories ready')

  // 3. Brands
  const insertedBrands = await retry(async () => {
    const brandData = [
      { name: 'Luxe Beauty', slug: 'luxe-beauty', logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=100' },
      { name: 'Nature Clean', slug: 'nature-clean', logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=100' },
    ]
    const current = await db.query.brands.findMany()
    if (current.length === 0) {
      return await db.insert(brands).values(brandData).returning()
    }
    return current
  })
  console.log('✅ Brands ready')

  // 4. Products
  await retry(async () => {
    const current = await db.query.products.findMany()
    if (current.length === 0) {
      const productData = [
        {
          name: 'Advanced Repair Serum',
          slug: 'advanced-repair-serum',
          description: 'A powerful serum for overnight skin rejuvenation.',
          price: "89.99",
          salePrice: "75.00",
          stock: 50,
          categoryId: insertedCats[0].id,
          brandId: insertedBrands[0].id,
          images: JSON.stringify(['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800']),
          isFeatured: true,
        },
        {
          name: 'Organic Argan Oil',
          slug: 'organic-argan-oil',
          description: 'Pure Moroccan argan oil for hair and skin.',
          price: "29.99",
          stock: 100,
          categoryId: insertedCats[1].id,
          brandId: insertedBrands[1].id,
          images: JSON.stringify(['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800']),
          isFeatured: true,
        }
      ]
      await db.insert(products).values(productData as any)
      console.log('✅ Products seeded')
    }
  })

  console.log('✨ Data infrastructure ready!')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seeding failed after retries:', err)
  process.exit(1)
})

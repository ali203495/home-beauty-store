import 'dotenv/config'
import { db } from '../utils/db'
import { users, categories, brands, products } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  // Clean existing data
  // await db.delete(products)
  // await db.delete(categories)
  // await db.delete(brands)
  // await db.delete(users)

  // Seed Admin from Environment Variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@el-wali.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  const [admin] = await db.insert(users).values({
    name: 'Admin User',
    email: adminEmail,
    passwordHash: hashedPassword,
    role: 'admin',
  }).returning()

  console.log('Admin created:', admin.email)

  // Seed Categories
  const catData = [
    { name: 'Skincare', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400' },
    { name: 'Haircare', slug: 'haircare', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400' },
    { name: 'Makeup', slug: 'makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
    { name: 'Fragrance', slug: 'fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400' },
  ]
  const insertedCats = await db.insert(categories).values(catData).returning()
  console.log(`${insertedCats.length} categories created`)

  // Seed Brands
  const brandData = [
    { name: 'Luxe Beauty', slug: 'luxe-beauty', logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=100' },
    { name: 'Nature Clean', slug: 'nature-clean', logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=100' },
  ]
  const insertedBrands = await db.insert(brands).values(brandData).returning()
  console.log(`${insertedBrands.length} brands created`)

  // Seed some products
  const productData = [
    {
      name: 'Advanced Repair Serum',
      slug: 'advanced-repair-serum',
      description: 'A powerful serum for overnight skin rejuvenation.',
      price: 89.99,
      salePrice: 75.00,
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
      price: 29.99,
      stock: 100,
      categoryId: insertedCats[1].id,
      brandId: insertedBrands[1].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800']),
      isFeatured: true,
    }
  ]
  await db.insert(products).values(productData)
  console.log('Products seeded')

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seeding failed:', err)
  process.exit(1)
})

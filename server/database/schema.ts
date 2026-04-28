import { pgTable, serial, text, integer, decimal, doublePrecision, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<'user' | 'admin'>().default('user').notNull(),
  avatar: text('avatar'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
  parentId: integer('parent_id'),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
})

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  description: text('description'),
  website: text('website'),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  stock: integer('stock').default(0).notNull(),
  images: text('images'), // JSON array string
  categoryId: integer('category_id').references(() => categories.id),
  brandId: integer('brand_id').references(() => brands.id),
  tags: text('tags'), // JSON array string
  specifications: text('specifications'), // JSON object string
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  slugIdx: index('slug_idx').on(table.slug),
  categoryIdx: index('category_idx').on(table.categoryId),
  isFeaturedIdx: index('featured_idx').on(table.isFeatured)
}))

// Enterprise: Site Metadata & Global Config
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // 'phone', 'email', 'address', 'shipping_notice', etc.
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  keyIdx: index('key_idx').on(table.key)
}))

// Enterprise: Activity Tracking for Recommendations
export const userViews = pgTable('user_views', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  sessionId: text('session_id'),
  productId: integer('product_id').references(() => products.id),
  viewedAt: timestamp('viewed_at').defaultNow().notNull()
}, (table) => ({
  viewedAtIdx: index('viewed_at_idx').on(table.viewedAt),
  sessionIdIdx: index('session_id_idx').on(table.sessionId)
}))

// Enterprise: Orders & Fulfillment
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  city: text('city').default('Marrakech').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').$type<'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'>().default('pending'),
  whatsappClicked: boolean('whatsapp_clicked').default(false),
  whatsappClickedAt: timestamp('whatsapp_clicked_at'),
  checkoutId: text('checkout_id').unique().notNull(), // STRIPE-GRADE IDEMPOTENCY
  metadata: text('metadata'), // JSON context for recovery
  recoveryCount: integer('recovery_count').default(0).notNull(),
  lastAttemptAt: timestamp('last_attempt_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  statusIdx: index('status_idx').on(table.status),
  checkoutIdIdx: index('checkout_id_idx').on(table.checkoutId),
  recoveryIdx: index('recovery_idx').on(table.lastAttemptAt)
}))

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  priceAtTime: decimal('price_at_time', { precision: 10, scale: 2 }).notNull()
})

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  rating: integer('rating').notNull(),
  title: text('title'),
  body: text('body'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// RELATIONS
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  reviews: many(reviews),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, { fields: [orders.userId], references: [users.id] })
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] })
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}))

export const userViewsRelations = relations(userViews, ({ one }) => ({
  product: one(products, { fields: [userViews.productId], references: [products.id] }),
}))

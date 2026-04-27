import { z } from 'zod'

export const OrderSchema = z.object({
  customerName: z.string().min(3).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^\+?[\d\s-]{8,20}$/, "Invalid phone format"),
  shippingAddress: z.string().min(10).max(500),
  totalAmount: z.number().positive(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1).max(50),
    priceAtTime: z.number().positive()
  })).min(1)
})

export type OrderInput = z.infer<typeof OrderSchema>

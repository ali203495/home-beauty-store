import { z } from 'zod'

export const OrderSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string(),
  total: z.number().positive(),
  checkoutId: z.string(),
  items: z.array(z.any()).min(1)
})

export type OrderInput = z.infer<typeof OrderSchema>

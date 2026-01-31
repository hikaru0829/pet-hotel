import { z } from 'zod'

export const reservationSchema = z.object({
  serviceType: z.enum(['DAYCARE', 'STAY', 'GROOMING']),
  serviceId: z.string(),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endTime: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  petId: z.string().optional(),
  ownerId: z.string(),
  staffId: z.string().optional(),
  vaccinesUpToDate: z.boolean(),
  groomingOptions: z.string().optional(),
  // Requirement D fields
  ownerName: z.string().min(1, '名前は必須です'),
  phone: z.string().min(1, '電話番号は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  petName: z.string().min(1, 'ペットの名前は必須です'),
  pickupOption: z.enum(['YES', 'NO']),
  pickupTime: z.string().optional(),
  notes: z.string().optional(),
})

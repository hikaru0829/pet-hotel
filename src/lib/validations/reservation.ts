import { z } from 'zod'

export const reservationSchema = z.object({
  serviceType: z.enum(['DAYCARE', 'STAY', 'GROOMING']),
  serviceId: z.string(),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endTime: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  petId: z.string(),
  ownerId: z.string(),
  staffId: z.string().optional(),
  vaccinesUpToDate: z.boolean(),
  groomingOptions: z.string().optional(),
})

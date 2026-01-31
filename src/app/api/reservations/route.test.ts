import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pet: {
      findUnique: vi.fn(),
    },
    service: {
      findUnique: vi.fn(),
    },
    reservation: {
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('POST /api/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a reservation successfully', async () => {
    const mockPet = { id: 'pet-1', vaccinesUpToDate: true }
    const mockService = { id: 'service-1', capacity: 10 }
    const mockReservation = { id: 'res-1', status: 'CONFIRMED' }

    vi.mocked(prisma.pet.findUnique).mockResolvedValue(mockPet as never)
    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService as never)
    vi.mocked(prisma.reservation.count).mockResolvedValue(0)
    vi.mocked(prisma.reservation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.reservation.create).mockResolvedValue(mockReservation as never)

    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'DAYCARE',
        serviceId: 'service-1',
        date: '2026-02-01',
        petId: 'pet-1',
        ownerId: 'owner-1',
        vaccinesUpToDate: true,
        ownerName: 'テスト太郎',
        phone: '090-0000-0000',
        email: 'test@example.com',
        petName: 'ポチ',
        pickupOption: 'NO',
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.status).toBe('CONFIRMED')
  })

  it('should create a reservation successfully for a new pet (no petId)', async () => {
    const mockService = { id: 'service-1', capacity: 10 }
    const mockReservation = { id: 'res-new', status: 'CONFIRMED' }

    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService as never)
    vi.mocked(prisma.reservation.count).mockResolvedValue(0)
    vi.mocked(prisma.reservation.create).mockResolvedValue(mockReservation as never)

    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'DAYCARE',
        serviceId: 'service-1',
        date: '2026-02-01',
        ownerId: 'owner-1',
        vaccinesUpToDate: true,
        ownerName: '新規太郎',
        phone: '090-1111-2222',
        email: 'new@example.com',
        petName: 'タマ',
        pickupOption: 'YES',
        pickupTime: '10:00',
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.status).toBe('CONFIRMED')
  })

  it('should return 400 if vaccines are not up to date', async () => {
    const mockPet = { id: 'pet-1', vaccinesUpToDate: false }
    vi.mocked(prisma.pet.findUnique).mockResolvedValue(mockPet as never)

    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'DAYCARE',
        serviceId: 'service-1',
        date: '2026-02-01',
        petId: 'pet-1',
        ownerId: 'owner-1',
        vaccinesUpToDate: false,
        ownerName: 'テスト太郎',
        phone: '090-0000-0000',
        email: 'test@example.com',
        petName: 'ポチ',
        pickupOption: 'NO',
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Vaccines must be up to date for reservation')
  })

  it('should return 400 if capacity is reached', async () => {
    const mockPet = { id: 'pet-1', vaccinesUpToDate: true }
    const mockService = { id: 'service-1', capacity: 5 }

    vi.mocked(prisma.pet.findUnique).mockResolvedValue(mockPet as never)
    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService as never)
    vi.mocked(prisma.reservation.count).mockResolvedValue(5)

    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'DAYCARE',
        serviceId: 'service-1',
        date: '2026-02-01',
        petId: 'pet-1',
        ownerId: 'owner-1',
        vaccinesUpToDate: true,
        ownerName: 'テスト太郎',
        phone: '090-0000-0000',
        email: 'test@example.com',
        petName: 'ポチ',
        pickupOption: 'NO',
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Service capacity reached for this date')
  })
})

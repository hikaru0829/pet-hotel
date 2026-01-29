import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
    const mockReservation = { id: 'res-1' }

    vi.mocked(prisma.pet.findUnique).mockResolvedValue(mockPet as any)
    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService as any)
    vi.mocked(prisma.reservation.count).mockResolvedValue(0)
    vi.mocked(prisma.reservation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.reservation.create).mockResolvedValue(mockReservation as any)

    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'DAYCARE',
        serviceId: 'service-1',
        date: '2026-02-01',
        petId: 'pet-1',
        ownerId: 'owner-1',
        vaccinesUpToDate: true,
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(mockReservation)
  })

  it('should return 400 if vaccines are not up to date', async () => {
    const mockPet = { id: 'pet-1', vaccinesUpToDate: false }
    vi.mocked(prisma.pet.findUnique).mockResolvedValue(mockPet as any)

    const req = new Request('http://localhost/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'DAYCARE',
        serviceId: 'service-1',
        date: '2026-02-01',
        petId: 'pet-1',
        ownerId: 'owner-1',
        vaccinesUpToDate: false,
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

    vi.mocked(prisma.pet.findUnique).mockResolvedValue(mockPet as any)
    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService as any)
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
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Service capacity reached for this date')
  })
})

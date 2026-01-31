import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reservationSchema } from '@/lib/validations/reservation'
import { ZodError } from 'zod'
import { sendReservationEmail, sendAdminNotificationEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = reservationSchema.parse(body)

    // 1. Vaccine Check
    if (validatedData.petId) {
      const pet = await prisma.pet.findUnique({
        where: { id: validatedData.petId },
      })

      if (!pet) {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
      }

      if (!validatedData.vaccinesUpToDate || !pet.vaccinesUpToDate) {
        return NextResponse.json(
          { error: 'Vaccines must be up to date for reservation' },
          { status: 400 }
        )
      }
    } else {
      if (!validatedData.vaccinesUpToDate) {
        return NextResponse.json(
          { error: 'Vaccines must be up to date for reservation' },
          { status: 400 }
        )
      }
    }

    // 2. Capacity Check
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const reservationCount = await prisma.reservation.count({
      where: {
        serviceId: validatedData.serviceId,
        date: validatedData.date,
        status: { not: 'CANCELLED' },
      },
    })

    if (reservationCount >= service.capacity) {
      return NextResponse.json(
        { error: 'Service capacity reached for this date' },
        { status: 400 }
      )
    }

    // 3. Duplicate Check
    if (validatedData.petId) {
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          petId: validatedData.petId,
          serviceId: validatedData.serviceId,
          date: validatedData.date,
          status: { not: 'CANCELLED' },
        },
      })

      if (existingReservation) {
        return NextResponse.json(
          { error: 'Pet already has a reservation for this service on this date' },
          { status: 400 }
        )
      }
    }

    // 4. Staff Availability Check
    if (validatedData.serviceType === 'GROOMING' && validatedData.staffId) {
      const staffReservation = await prisma.reservation.findFirst({
        where: {
          staffId: validatedData.staffId,
          date: validatedData.date,
          startTime: validatedData.startTime,
          status: { not: 'CANCELLED' },
        },
      })
      if (staffReservation) {
        return NextResponse.json(
          { error: 'Selected staff member is not available at this time' },
          { status: 400 }
        )
      }
    }

    // 5. Create Reservation
    const reservation = await prisma.reservation.create({
      data: {
        serviceType: validatedData.serviceType,
        service: { connect: { id: validatedData.serviceId } },
        date: validatedData.date,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        pet: validatedData.petId ? { connect: { id: validatedData.petId } } : undefined,
        owner: { connect: { id: validatedData.ownerId } },
        staff: validatedData.staffId ? { connect: { id: validatedData.staffId } } : undefined,
        groomingOptions: validatedData.groomingOptions,
        status: 'CONFIRMED',
        ownerName: validatedData.ownerName,
        phone: validatedData.phone,
        email: validatedData.email,
        petName: validatedData.petName,
        pickupOption: validatedData.pickupOption,
        pickupTime: validatedData.pickupTime,
        notes: validatedData.notes,
      },
    })

    // 6. Send Email Notifications
    await Promise.all([
      sendReservationEmail(reservation),
      sendAdminNotificationEmail(reservation)
    ])

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Reservation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

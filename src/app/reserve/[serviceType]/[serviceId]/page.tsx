import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReservationForm from '@/components/ReservationForm'

export default async function ReservePage({
  params,
}: {
  params: Promise<{ serviceType: string; serviceId: string }>
}) {
  const { serviceType, serviceId: rawServiceId } = await params
  const serviceId = decodeURIComponent(rawServiceId)

  console.log(`Searching for service: type=${serviceType}, id=${serviceId}`)

  // Map URL serviceType to Prisma enum
  const typeMap: Record<string, 'DAYCARE' | 'STAY' | 'GROOMING'> = {
    daycare: 'DAYCARE',
    stay: 'STAY',
    grooming: 'GROOMING',
  }

  const prismaType = typeMap[serviceType.toLowerCase()]
  if (!prismaType) {
    console.log(`PrismaType not found for ${serviceType}`)
    notFound()
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    console.log(`Service not found for id: ${serviceId}`)
    notFound()
  }

  if (service.type !== prismaType) {
    console.log(`Service type mismatch: ${service.type} !== ${prismaType}`)
    notFound()
  }

  // Get user (In a real app, use getServerSession)
  const user = await prisma.user.findFirst()
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
        <p className="text-gray-600">予約を行うには、まずログインしてください。</p>
      </div>
    )
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            予約リクエスト
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            ご希望の日時とペットを選択してください。
          </p>
        </div>
        <ReservationForm 
          service={service} 
          pets={pets} 
          ownerId={user.id} 
        />
      </div>
    </div>
  )
}

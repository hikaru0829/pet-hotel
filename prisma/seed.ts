import "dotenv/config";
import { PrismaClient, ServiceType } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  log: ['query'],
  adapter,
})

async function main() {
  // Create test user and pet if they don't exist
  const owner = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'テスト太郎',
      role: 'OWNER',
    },
  })

  await prisma.pet.upsert({
    where: { id: 'test-pet-id' },
    update: {},
    create: {
      id: 'test-pet-id',
      name: 'ポチ',
      type: 'DOG',
      breed: '柴犬',
      age: 3,
      vaccinesUpToDate: true,
      ownerId: owner.id,
    },
  })

  // Services
  const services: { id: string; name: string; type: ServiceType; description: string; price: number; capacity: number }[] = [
    {
      id: 'daycare-standard',
      name: 'スタンダード保育園',
      type: ServiceType.DAYCARE,
      description: '日中の預かりと、基本的なしつけトレーニングが含まれます。',
      price: 3000,
      capacity: 10,
    },
    {
      id: 'stay-premium',
      name: 'プレミアムペットホテル',
      type: ServiceType.STAY,
      description: '24時間スタッフ常駐。個室でのんびり過ごせます。',
      price: 8000,
      capacity: 5,
    },
    {
      id: 'grooming-full',
      name: 'フルコーストリミング',
      type: ServiceType.GROOMING,
      description: 'シャンプー、カット、爪切り、耳掃除のトータルケア。',
      price: 6000,
      capacity: 3,
    },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    })
  }

  console.log('Seed data created successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

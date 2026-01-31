import { prisma } from './src/lib/prisma'

async function testConnection() {
  try {
    console.log('Attempting to connect to database...')
    const services = await prisma.service.findMany()
    console.log('Connection successful!')
    console.log('Services count:', services.length)
  } catch (error) {
    console.error('Database connection failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

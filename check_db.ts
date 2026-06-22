import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  console.log('User count:', userCount)
  const matchCount = await prisma.match.count()
  console.log('Match count:', matchCount)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

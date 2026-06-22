import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const match = await prisma.match.findFirst()
  console.log('MATCH_ID:' + match?.id)
}
main().finally(() => prisma.$disconnect())

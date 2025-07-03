const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('adminpassword', 10)
  await prisma.user.upsert({
    where: { email: 'dubeykanu02@gmail.com' },
    update: { password: adminPassword, role: 'admin', name: 'Admin User' },
    create: {
      name: 'Admin User',
      email: 'dubeykanu02@gmail.com',
      password: adminPassword,
      role: 'admin',
    },
  })

  const clientPassword = await bcrypt.hash('clientpassword', 10)
  await prisma.user.upsert({
    where: { email: 'client@aiimsjammu.edu.in' },
    update: { password: clientPassword, role: 'client', name: 'Client User' },
    create: {
      name: 'Client User',
      email: 'client@aiimsjammu.edu.in',
      password: clientPassword,
      role: 'client',
    },
  })

  console.log('Users created or updated!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
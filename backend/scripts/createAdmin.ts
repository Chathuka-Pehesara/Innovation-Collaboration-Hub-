import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@innovationhub.com';
  const password = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'admin',
      isVerified: true,
      password,
    },
    create: {
      email,
      name: 'Super Admin',
      role: 'admin',
      isVerified: true,
      password,
      specialization: 'System Administration',
      bio: 'Platform administrator for the Innovation Collaboration Hub.',
      xp: 9999,
      level: 100,
    },
  });

  console.log(`Admin user ensured: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

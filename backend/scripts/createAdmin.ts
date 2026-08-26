/// <reference types="node" />
import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@innovationhub.com';
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!rawPassword) {
    console.error('❌  Error: ADMIN_PASSWORD is not set in your .env file.');
    console.log('   Add this to backend/.env:');
    console.log('   ADMIN_EMAIL=admin@yourdomain.com');
    console.log('   ADMIN_PASSWORD=your_secure_password_here');
    process.exit(1);
  }

  const password = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      isVerified: true,
      password,
    },
    create: {
      email,
      username: 'admin',
      name: 'Super Admin',
      role: Role.ADMIN,
      isVerified: true,
      password,
      specialization: 'System Administration',
      bio: 'Platform administrator for the Innovation Collaboration Hub.',
      xp: 9999,
      level: 100,
    },
  });

  console.log(`✅  Admin user ensured: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

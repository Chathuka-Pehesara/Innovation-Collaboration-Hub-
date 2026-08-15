/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = process.argv[2] || process.env.ADMIN_EMAIL;

  if (!targetEmail) {
    console.error('Error: Please provide a target user email address.');
    console.log('Usage: npx ts-node scripts/setAdmin.ts <email>');
    process.exit(1);
  }

  const emailLower = targetEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (!user) {
    console.error(`Error: User with email "${emailLower}" not found in database.`);
    process.exit(1);
  }

  const updatedUser = await prisma.user.update({
    where: { email: emailLower },
    data: {
      role: 'admin',
    },
  });

  console.log(`Successfully updated user "${updatedUser.name}" (${updatedUser.email}) to role: ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

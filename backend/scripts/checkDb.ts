/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('===================================================');
  console.log('            DATABASE RECORDS SUMMARY               ');
  console.log('===================================================\n');

  // 1. Users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      specialization: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`👤 USERS (${users.length} total):`);
  if (users.length === 0) {
    console.log('  No users found in database.');
  } else {
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. [${u.role.toUpperCase()}] ${u.name} <${u.email}> (ID: ${u.id.slice(0, 8)}...)`);
    });
  }
  console.log('\n---------------------------------------------------');

  // 2. Projects
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      teamSize: true,
      createdAt: true,
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📁 PROJECTS (${projects.length} total/recent):`);
  if (projects.length === 0) {
    console.log('  No projects found in database.');
  } else {
    projects.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.status}] ${p.title} (Team Size: ${p.teamSize})`);
    });
  }
  console.log('\n---------------------------------------------------');

  // 3. Teams
  const teams = await prisma.team.findMany({
    include: {
      members: true,
      project: { select: { title: true } },
    },
    take: 5,
  });

  console.log(`👥 TEAMS (${teams.length} total/recent):`);
  if (teams.length === 0) {
    console.log('  No active teams found in database.');
  } else {
    teams.forEach((t, i) => {
      console.log(`  ${i + 1}. Team for "${t.project?.title || 'Unknown'}" (${t.members.length} members)`);
    });
  }
  console.log('\n===================================================');
}

main()
  .catch((e) => {
    console.error('Database connection / query error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

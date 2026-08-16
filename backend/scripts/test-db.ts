import { PrismaClient } from '@prisma/client';

async function testConnection(url: string, name: string) {
  console.log(`\n🔍 Testing ${name}...`);
  const client = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  try {
    await client.$connect();
    console.log(`✅ ${name} connected successfully!`);

    const userCount = await client.user.count();
    const projectCount = await client.project.count();

    console.log(`📊 Current Database Stats (${name}):`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Projects: ${projectCount}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${name} test failed:`, error.message || error);
    return false;
  } finally {
    await client.$disconnect();
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  console.log('--- DATABASE CONNECTION VERIFICATION ---');
  if (dbUrl) await testConnection(dbUrl, 'DATABASE_URL (Pooled)');
  if (directUrl) await testConnection(directUrl, 'DIRECT_URL (Direct Session)');
}

main();

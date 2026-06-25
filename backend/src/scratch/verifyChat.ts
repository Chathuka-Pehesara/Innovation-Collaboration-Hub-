import { PrismaClient } from '@prisma/client';
import * as chatService from '../services/chatService';
import * as notificationService from '../services/notificationService';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('--- Starting Chat & Notifications Module Verification ---');

  try {
    // 1. Ensure a default Category and Project exists
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Engineering Verification' }
      });
    }

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({
        data: {
          title: 'Verification Workspace',
          description: 'Automated test suite playground to ensure compilation holds.',
          ownerId: 'user_123',
          categoryId: category.id,
          teamSize: 3
        }
      });
    }

    // 2. Ensure Team exists
    let team = await prisma.team.findUnique({
      where: { projectId: project.id }
    });

    if (!team) {
      team = await prisma.team.create({
        data: { projectId: project.id }
      });
      console.log(`Created Team for Verification: ${team.id}`);
    }

    // 3. Ensure Team Members exist
    const testUsers = ['user_123', 'user_abc'];
    for (const userId of testUsers) {
      await prisma.teamMember.upsert({
        where: {
          teamId_userId: { teamId: team.id, userId }
        },
        create: {
          teamId: team.id,
          userId,
          role: userId === 'user_123' ? 'LEAD' : 'MEMBER'
        },
        update: {}
      });
    }

    console.log('Team and members successfully validated.');

    // 4. Test Chat creation & retrieve histories
    const teamChatId = await chatService.findOrCreateTeamChat(team.id);
    console.log(`Team Chat successfully created/found. ID: ${teamChatId}`);

    const dmChatId = await chatService.findOrCreateDMChat('user_123', 'user_abc');
    console.log(`Direct message room successfully created/found. ID: ${dmChatId}`);

    // 5. Test sending messages
    const teamMsg = await chatService.sendTeamMessage(team.id, 'user_123', 'Hello, this is a verify run!');
    console.log(`Sent team message successfully: "${teamMsg.content}"`);

    const dmMsg = await chatService.sendDMMessage('user_123', 'user_abc', 'Hello target user in DM!');
    console.log(`Sent DM message successfully: "${dmMsg.content}"`);

    // 6. Verify read receipts
    await chatService.markChatAsRead(teamChatId, 'user_abc');
    console.log('Read receipt processed successfully.');

    // 7. Verify Notifications trigger & dispatch
    const notif = await notificationService.createNotification(
      'user_abc',
      'SYSTEM',
      'System Verification Alert',
      'This alert confirms notifications engine is fully compile-safe.'
    );
    console.log(`Created notification successfully: "${notif.title}" (isRead: ${notif.isRead})`);

    // Clean up test message records
    await prisma.messageReceipt.deleteMany({
      where: { messageId: { in: [teamMsg.id, dmMsg.id] } }
    });
    await prisma.message.deleteMany({
      where: { id: { in: [teamMsg.id, dmMsg.id] } }
    });
    await prisma.notification.delete({
      where: { id: notif.id }
    });

    console.log('--- Verification Completed Successfully! ---');
  } catch (error) {
    console.error('❌ Verification check failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();

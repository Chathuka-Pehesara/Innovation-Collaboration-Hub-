import { PrismaClient } from '@prisma/client';
import { getIo } from '../socket/chatSocket';
import * as notificationService from './notificationService';

const prisma = new PrismaClient();

// Helper to find or create a team chat
export const findOrCreateTeamChat = async (teamId: string): Promise<string> => {
  const existing = await prisma.chat.findUnique({
    where: { teamId }
  });

  if (existing) return existing.id;

  const chat = await prisma.chat.create({
    data: {
      teamId,
      isGroup: true,
      name: `Team Chat - ${teamId}`
    }
  });

  // Populate initial participants from team members
  const members = await prisma.teamMember.findMany({
    where: { teamId }
  });

  if (members.length > 0) {
    await prisma.chatParticipant.createMany({
      data: members.map(m => ({
        chatId: chat.id,
        userId: m.userId
      })),
      skipDuplicates: true
    });
  }

  return chat.id;
};

// Helper to find or create a DM chat between two users
export const findOrCreateDMChat = async (userA: string, userB: string): Promise<string> => {
  // Find a non-group chat where both userA and userB are participants
  const chats = await prisma.chat.findMany({
    where: {
      isGroup: false,
      participants: {
        some: { userId: userA }
      }
    },
    include: {
      participants: true
    }
  });

  const matchingChat = chats.find(c => 
    c.participants.some(p => p.userId === userB)
  );

  if (matchingChat) return matchingChat.id;

  // Create new DM chat
  const chat = await prisma.chat.create({
    data: {
      isGroup: false
    }
  });

  await prisma.chatParticipant.createMany({
    data: [
      { chatId: chat.id, userId: userA },
      { chatId: chat.id, userId: userB }
    ]
  });

  return chat.id;
};

// GET /chats/team/:teamId/messages
export const getTeamMessages = async (teamId: string, userId: string, limit: number, before?: string) => {
  // Verify user is in the team
  const isMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId }
    }
  });

  if (!isMember) {
    throw new Error('Forbidden: User is not a member of this team');
  }

  const chatId = await findOrCreateTeamChat(teamId);

  // Mark all previous messages as read
  await markChatAsRead(chatId, userId);

  const messages = await prisma.message.findMany({
    where: { chatId },
    take: limit,
    skip: before ? 1 : 0,
    cursor: before ? { id: before } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      receipts: true
    }
  });

  // Reverse so they are returned in chronological order
  return messages.reverse();
};

// POST /chats/team/:teamId/messages
export const sendTeamMessage = async (teamId: string, userId: string, content: string) => {
  // Verify member
  const isMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId }
    }
  });

  if (!isMember) {
    throw new Error('Forbidden: User is not a member of this team');
  }

  const chatId = await findOrCreateTeamChat(teamId);

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: userId,
      content
    },
    include: {
      receipts: true
    }
  });

  // Trigger self read receipt
  await prisma.messageReceipt.create({
    data: {
      messageId: message.id,
      userId
    }
  }).catch(() => {}); // ignore duplicates

  // Broadcast to chat room via Sockets
  const io = getIo();
  if (io) {
    io.to(chatId).emit('message:new', message);
  }

  // Create notifications for other team members
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId }
  });

  const recipients = teamMembers.filter(m => m.userId !== userId);
  for (const recipient of recipients) {
    await notificationService.createNotification(
      recipient.userId,
      'TEAM_MESSAGE',
      'New Team Message',
      `You have a new message in your team chat from ${userId}`,
      teamId
    );
  }

  return message;
};

// GET /chats/dm/:userId/messages
export const getDMMessages = async (activeUserId: string, targetUserId: string, limit: number, before?: string) => {
  const chatId = await findOrCreateDMChat(activeUserId, targetUserId);

  // Mark all previous messages as read
  await markChatAsRead(chatId, activeUserId);

  const messages = await prisma.message.findMany({
    where: { chatId },
    take: limit,
    skip: before ? 1 : 0,
    cursor: before ? { id: before } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      receipts: true
    }
  });

  return messages.reverse();
};

// POST /chats/dm/:userId/messages
export const sendDMMessage = async (activeUserId: string, targetUserId: string, content: string) => {
  const chatId = await findOrCreateDMChat(activeUserId, targetUserId);

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: activeUserId,
      content
    },
    include: {
      receipts: true
    }
  });

  // Trigger self read receipt
  await prisma.messageReceipt.create({
    data: {
      messageId: message.id,
      userId: activeUserId
    }
  }).catch(() => {});

  // Broadcast to socket room
  const io = getIo();
  if (io) {
    io.to(chatId).emit('message:new', message);
  }

  // Trigger notification for the recipient
  await notificationService.createNotification(
    targetUserId,
    'DM_MESSAGE',
    'New Direct Message',
    `You have a new direct message from ${activeUserId}`,
    activeUserId
  );

  return message;
};

// POST /chats/:chatId/files
export const saveChatFile = async (
  chatId: string,
  userId: string,
  fileUrl: string,
  fileName: string,
  fileType: string
) => {
  // Ensure user is participant
  const isParticipant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId }
  });

  if (!isParticipant) {
    throw new Error('Forbidden: User is not a participant in this chat');
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: userId,
      content: null,
      fileUrl,
      fileName,
      fileType
    },
    include: {
      receipts: true
    }
  });

  // Self receipt
  await prisma.messageReceipt.create({
    data: {
      messageId: message.id,
      userId
    }
  }).catch(() => {});

  const io = getIo();
  if (io) {
    io.to(chatId).emit('message:new', message);
  }

  // Find other participants to notify
  const participants = await prisma.chatParticipant.findMany({
    where: { chatId }
  });

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });

  const recipients = participants.filter(p => p.userId !== userId);
  for (const recipient of recipients) {
    await notificationService.createNotification(
      recipient.userId,
      chat?.isGroup ? 'TEAM_MESSAGE' : 'DM_MESSAGE',
      chat?.isGroup ? 'New Team File Shared' : 'New File Shared in DM',
      `File shared: "${fileName}" by ${userId}`,
      chat?.teamId || userId
    );
  }

  return message;
};

// Mark all messages in a chat as read by a user
export const markChatAsRead = async (chatId: string, userId: string) => {
  const unreadMessages = await prisma.message.findMany({
    where: {
      chatId,
      senderId: { not: userId },
      receipts: {
        none: { userId }
      }
    }
  });

  if (unreadMessages.length === 0) return;

  const dataToInsert = unreadMessages.map(msg => ({
    messageId: msg.id,
    userId
  }));

  await prisma.messageReceipt.createMany({
    data: dataToInsert,
    skipDuplicates: true
  });

  // Notify other users in the chat via Sockets
  const io = getIo();
  if (io) {
    io.to(chatId).emit('message:read', {
      chatId,
      userId,
      messageIds: unreadMessages.map(m => m.id),
      readAt: new Date()
    });
  }
};

import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { getIo, isUserOnline } from '../socket/chatSocket';

const prisma = new PrismaClient();

// Configure SMTP transport with robust fallbacks
const getNotificationTransporter = () => {
  const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '1025', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const config: any = {
    host,
    port,
    secure: port === 465,
    tls: {
      rejectUnauthorized: false
    }
  };

  if (user && pass && user !== 'your_smtp_user' && pass !== 'your_smtp_password') {
    config.auth = { user, pass };
  }

  return nodemailer.createTransport(config);
};

const transporter = getNotificationTransporter();

// GET /notifications/:userId
export const getUserNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

// PUT /notifications/:userId/:notifId/read
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification || notification.userId !== userId) {
    throw new Error('Notification not found');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
};

// PUT /notifications/:userId/read-all
export const markAllNotificationsAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

// POST /notifications/trigger / Internal creation
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  referenceId?: string
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      referenceId: referenceId || null
    }
  });

  // Broadcast to user room if online
  const io = getIo();
  const online = isUserOnline(userId);

  if (io && online) {
    io.to(userId).emit('notification:new', notification);
  } else {
    // User is offline: dispatch email alert
    await sendEmailNotification(userId, title, message).catch(console.error);
  }

  return notification;
};

// Email notification sender helper
export const sendEmailNotification = async (userId: string, title: string, message: string) => {
  // Construct email address from university profile or mock format
  const emailAddress = `${userId.replace(/[^a-zA-Z0-9]/g, '')}@university.edu`;

  const mailOptions = {
    from: '"Innovation & Collaboration Hub" <no-reply@university.edu>',
    to: emailAddress,
    subject: `[Notification] ${title}`,
    text: `${message}\n\nThis is an automated notification from the Innovation & Collaboration Hub. Please login to reply.`,
    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">${title}</h2>
      <p style="color: #334155; line-height: 1.5; font-size: 16px;">${message}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated notification from the Innovation & Collaboration Hub. Please do not reply directly to this email.</p>
    </div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email notification successfully sent to ${emailAddress}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`Failed to dispatch email to ${emailAddress} (transporter configuration incomplete):`, error);
    return false;
  }
};

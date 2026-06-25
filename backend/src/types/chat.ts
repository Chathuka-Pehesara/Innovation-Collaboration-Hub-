export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: Date;
  receipts?: MessageReceipt[];
}

export interface MessageReceipt {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: Date;
}

export interface Chat {
  id: string;
  name: string | null;
  isGroup: boolean;
  teamId: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  participants?: ChatParticipant[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string; // "TEAM_MESSAGE" | "DM_MESSAGE" | "SYSTEM"
  title: string;
  message: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: Date;
}

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'call' | 'system';
export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'active' | 'ended' | 'missed' | 'declined' | 'failed' | 'connecting';

export interface Reaction {
  emoji: string;
  userId: string;
  username: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface ReplyToMeta {
  messageId: string;
  senderId: string;
  senderName: string;
  preview: string;
}

export interface CallInfo {
  callId: string;
  callType: CallType;
  status: CallStatus;
  startedAt: FirebaseFirestoreTypes.Timestamp;
  endedAt?: FirebaseFirestoreTypes.Timestamp;
  durationSeconds?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  body: string;
  messageType: MessageType;
  mediaUrl?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  status: MessageStatus;
  deliveredTo: string[];
  readBy: string[];
  replyTo?: ReplyToMeta;
  reactions: Reaction[];
  callInfo?: CallInfo;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface ChatPreview {
  id: string;
  chatType: 'direct' | 'group';
  name: string;
  avatarUrl?: string;
  participants: string[];
  participantProfiles: UserProfileSummary[];
  lastMessage?: Message;
  unreadCount: number;
  lastActivityAt?: FirebaseFirestoreTypes.Timestamp;
  mutedUntil?: FirebaseFirestoreTypes.Timestamp | null;
  archived?: boolean;
  typingUsers: string[];
  callBadge?: CallStatus;
}

export interface UserProfile {
  uid: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: FirebaseFirestoreTypes.Timestamp;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  stats?: {
    totalMessages?: number;
    totalCalls?: number;
    missedCalls?: number;
  };
}

export interface UserProfileSummary {
  uid: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
}

export interface TypingIndicatorState {
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface CallSession {
  callId: string;
  chatId: string;
  callerId: string;
  calleeIds: string[];
  callType: CallType;
  status: CallStatus;
  startedAt?: number;
  acceptedAt?: number;
  endedAt?: number;
  durationSeconds?: number;
  isGroupCall?: boolean;
  isMuted?: boolean;
  isCameraOn?: boolean;
}

export interface NotificationPayload {
  type: 'message' | 'reply' | 'reaction' | 'call';
  chatId: string;
  senderId: string;
  senderName: string;
  messageId?: string;
  messagePreview?: string;
  callId?: string;
  callType?: CallType;
  callStatus?: CallStatus;
}

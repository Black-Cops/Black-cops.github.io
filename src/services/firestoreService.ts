import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type {
  ChatPreview,
  Message,
  MessageStatus,
  TypingIndicatorState,
  UserProfile,
  UserProfileSummary,
  CallInfo,
} from '../types';

const USERS_COLLECTION = 'users';
const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';
const TYPING_SUBCOLLECTION = 'typing';
const CALLS_SUBCOLLECTION = 'calls';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const doc = await firestore().collection(USERS_COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
};

export const createOrUpdateUserProfile = async (
  uid: string,
  payload: Partial<UserProfile>
): Promise<void> => {
  const now = firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp;
  await firestore()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .set({
      uid,
      username: payload.username,
      avatarUrl: payload.avatarUrl,
      bio: payload.bio ?? '',
      phoneNumber: payload.phoneNumber ?? '',
      email: payload.email ?? '',
      createdAt: payload.createdAt ?? now,
      updatedAt: now,
      isOnline: true,
      stats: payload.stats ?? {},
    }, { merge: true });
};

export const listenToUsers = (
  callback: (users: UserProfileSummary[]) => void
): (() => void) => {
  return firestore()
    .collection(USERS_COLLECTION)
    .orderBy('username', 'asc')
    .onSnapshot((snapshot) => {
      const users: UserProfileSummary[] = snapshot.docs.map((doc) => {
        const data = doc.data() as UserProfile;
        return {
          uid: data.uid,
          username: data.username,
          avatarUrl: data.avatarUrl,
          isOnline: data.isOnline,
        };
      });
      callback(users);
    });
};

export const listenToChatPreviews = (
  uid: string,
  callback: (chats: ChatPreview[]) => void
): (() => void) => {
  return firestore()
    .collection(CHATS_COLLECTION)
    .where('participantIds', 'array-contains', uid)
    .onSnapshot(async (snapshot) => {
      const chats: ChatPreview[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const participantProfiles = await Promise.all(
            data.participantIds.map(async (participantId: string) => {
              const userDoc = await firestore().collection(USERS_COLLECTION).doc(participantId).get();
              const userData = userDoc.data() as UserProfile;
              return {
                uid: userData.uid,
                username: userData.username,
                avatarUrl: userData.avatarUrl,
                isOnline: userData.isOnline,
              } as UserProfileSummary;
            })
          );

          const lastMessage = data.lastMessage
            ? ({ id: 'last', ...data.lastMessage } as Message)
            : undefined;

          return {
            id: doc.id,
            chatType: data.chatType,
            name: data.name,
            avatarUrl: data.avatarUrl,
            participants: data.participantIds,
            participantProfiles,
            lastMessage,
            unreadCount: data.unread?.[uid] ?? 0,
            lastActivityAt: data.lastActivityAt,
            mutedUntil: data.mutedUntil?.[uid] ?? null,
            archived: data.archived?.includes(uid),
            typingUsers: [],
            callBadge: data.callBadge,
          } as ChatPreview;
        })
      );
      callback(chats);
    });
};

export const listenToMessages = (
  chatId: string,
  limit: number,
  callback: (messages: Message[]) => void
): (() => void) => {
  return firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .onSnapshot((snapshot) => {
      const messages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Message) }))
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

      callback(messages);
    });
};

export const fetchMoreMessages = async (
  chatId: string,
  lastMessage: Message,
  limit: number
): Promise<Message[]> => {
  const snapshot = await firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('createdAt', 'desc')
    .startAfter(lastMessage.createdAt)
    .limit(limit)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Message) }))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
};

export const sendMessage = async (
  chatId: string,
  payload: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const now = firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp;

  const messagePayload = {
    ...payload,
    createdAt: now,
    updatedAt: now,
  };

  const chatRef = firestore().collection(CHATS_COLLECTION).doc(chatId);
  await chatRef.collection(MESSAGES_SUBCOLLECTION).add(messagePayload);

  await chatRef.set(
    {
      lastMessage: messagePayload,
      lastActivityAt: now,
    },
    { merge: true }
  );
};

export const setTypingState = async (
  chatId: string,
  uid: string,
  typingState: Omit<TypingIndicatorState, 'updatedAt'>
): Promise<void> => {
  const now = firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp;
  await firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(TYPING_SUBCOLLECTION)
    .doc(uid)
    .set(
      {
        ...typingState,
        updatedAt: now,
      },
      { merge: true }
    );
};

export const listenToTypingState = (
  chatId: string,
  callback: (states: TypingIndicatorState[]) => void
): (() => void) => {
  return firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(TYPING_SUBCOLLECTION)
    .onSnapshot((snapshot) => {
      const states = snapshot.docs.map((doc) => (
        { id: doc.id, ...(doc.data() as TypingIndicatorState) } as TypingIndicatorState
      ));
      callback(states);
    });
};

export const updateMessageStatus = async (
  chatId: string,
  messageId: string,
  field: 'deliveredTo' | 'readBy',
  uid: string
): Promise<void> => {
  const fieldValue = firestore.FieldValue.arrayUnion(uid);
  await firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(MESSAGES_SUBCOLLECTION)
    .doc(messageId)
    .set(
      {
        [field]: fieldValue,
        status: field === 'readBy' ? 'read' : 'delivered',
      },
      { merge: true }
    );
};

export const toggleReaction = async (
  chatId: string,
  messageId: string,
  reaction: { emoji: string; userId: string; username: string }
): Promise<void> => {
  const messageRef = firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(MESSAGES_SUBCOLLECTION)
    .doc(messageId);

  await firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(messageRef);
    if (!doc.exists) return;

    const data = doc.data() as Message;
    const existingReactionIndex = data.reactions?.findIndex(
      (item) => item.userId === reaction.userId
    );

    let updatedReactions;
    if (existingReactionIndex !== undefined && existingReactionIndex >= 0 && data.reactions) {
      if (data.reactions[existingReactionIndex].emoji === reaction.emoji) {
        updatedReactions = data.reactions.filter((item) => item.userId !== reaction.userId);
      } else {
        updatedReactions = [...data.reactions];
        updatedReactions[existingReactionIndex] = {
          ...updatedReactions[existingReactionIndex],
          emoji: reaction.emoji,
        };
      }
    } else {
      updatedReactions = [
        ...(data.reactions ?? []),
        {
          ...reaction,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
      ];
    }

    transaction.update(messageRef, { reactions: updatedReactions });
  });
};

export const deleteMessage = async (
  chatId: string,
  messageId: string,
  forEveryone: boolean,
  uid: string
): Promise<void> => {
  const messageRef = firestore()
    .collection(CHATS_COLLECTION)
    .doc(chatId)
    .collection(MESSAGES_SUBCOLLECTION)
    .doc(messageId);

  if (forEveryone) {
    await messageRef.set(
      {
        messageType: 'system',
        body: 'This message was deleted',
        status: 'read',
      },
      { merge: true }
    );
  } else {
    await messageRef.set(
      {
        deletedFor: firestore.FieldValue.arrayUnion(uid),
      },
      { merge: true }
    );
  }
};

export const logCall = async (
  chatId: string,
  callInfo: CallInfo,
  participants: string[]
): Promise<void> => {
  const now = firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp;

  const callPayload = {
    ...callInfo,
    createdAt: now,
  };

  const chatRef = firestore().collection(CHATS_COLLECTION).doc(chatId);
  await chatRef.collection(CALLS_SUBCOLLECTION).add(callPayload);

  await chatRef.collection(MESSAGES_SUBCOLLECTION).add({
    senderId: callInfo.callId,
    senderName: 'system',
    body: `${callInfo.callType === 'voice' ? 'Voice' : 'Video'} call`,
    messageType: 'call',
    status: 'read',
    deliveredTo: participants,
    readBy: [],
    reactions: [],
    callInfo,
    createdAt: now,
    updatedAt: now,
  });

  await chatRef.set(
    {
      callBadge: callInfo.status,
      lastActivityAt: now,
    },
    { merge: true }
  );
};

export const updatePresence = async (uid: string, isOnline: boolean): Promise<void> => {
  const now = firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp;
  await firestore()
    .collection(USERS_COLLECTION)
    .doc(uid)
    .set(
      {
        isOnline,
        lastSeen: now,
      },
      { merge: true }
    );
};

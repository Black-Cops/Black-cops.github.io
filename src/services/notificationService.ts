import messaging from '@react-native-firebase/messaging';
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import type { NotificationPayload } from '../types';

export const initializeNotifications = async () => {
  PushNotification.configure({
    onRegister: async (token) => {
      console.log('FCM Token:', token.token);
    },

    onNotification: (notification) => {
      console.log('Notification:', notification);
    },

    onAction: (notification) => {
      console.log('Action:', notification.action);
    },

    onRegistrationError: (err) => {
      console.error('Registration error:', err);
    },

    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'default',
      channelName: 'Default',
      channelDescription: 'Default notification channel',
      playSound: true,
      soundName: 'default',
      importance: Importance.HIGH,
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );

  PushNotification.createChannel(
    {
      channelId: 'calls',
      channelName: 'Calls',
      channelDescription: 'Incoming call notifications',
      playSound: true,
      soundName: 'default',
      importance: Importance.HIGH,
      vibrate: true,
    },
    (created) => console.log(`createChannel 'calls' returned '${created}'`)
  );

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification authorization status:', authStatus);
  }

  messaging().onMessage(async (remoteMessage) => {
    handleForegroundNotification(remoteMessage);
  });

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background message:', remoteMessage);
  });
};

const handleForegroundNotification = (remoteMessage: any) => {
  const data = remoteMessage.data as NotificationPayload;

  let title = 'New Notification';
  let body = remoteMessage.notification?.body || '';
  let channelId = 'default';

  if (data.type === 'call') {
    title = `${data.senderName} is calling...`;
    body = `${data.callType === 'voice' ? 'Voice' : 'Video'} call`;
    channelId = 'calls';
  } else if (data.type === 'message') {
    title = data.senderName;
    body = data.messagePreview || 'New message';
  } else if (data.type === 'reply') {
    title = data.senderName;
    body = `Replied: ${data.messagePreview}`;
  } else if (data.type === 'reaction') {
    title = data.senderName;
    body = 'Reacted to your message';
  }

  PushNotification.localNotification({
    channelId,
    title,
    message: body,
    playSound: true,
    soundName: 'default',
    vibrate: true,
    priority: 'high',
    importance: 'high',
    userInfo: data,
  });
};

export const sendLocalNotification = (
  title: string,
  message: string,
  data?: any
) => {
  PushNotification.localNotification({
    channelId: 'default',
    title,
    message,
    playSound: true,
    soundName: 'default',
    vibrate: true,
    priority: 'high',
    importance: 'high',
    userInfo: data,
  });
};

export const sendCallNotification = (
  callerName: string,
  callType: 'voice' | 'video',
  data: any
) => {
  PushNotification.localNotification({
    channelId: 'calls',
    title: `${callerName} is calling...`,
    message: `${callType === 'voice' ? 'Voice' : 'Video'} call`,
    playSound: true,
    soundName: 'default',
    vibrate: true,
    priority: 'max',
    importance: 'high',
    ongoing: true,
    userInfo: data,
  });
};

export const cancelNotification = (notificationId: number) => {
  PushNotification.cancelLocalNotification(notificationId);
};

export const clearAllNotifications = () => {
  PushNotification.cancelAllLocalNotifications();
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

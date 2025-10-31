import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const formatMessageTime = (timestamp: FirebaseFirestoreTypes.Timestamp | undefined): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  let period = '';
  if (hours >= 21 || hours < 5) {
    period = 'at night';
  } else if (hours >= 17) {
    period = 'in the evening';
  } else if (hours >= 12) {
    period = 'in the afternoon';
  } else if (hours >= 5) {
    period = 'in the morning';
  } else {
    period = 'at night';
  }
  
  return `${displayHours}:${displayMinutes} ${period}`;
};

export const formatChatListTime = (timestamp: FirebaseFirestoreTypes.Timestamp | undefined): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${isPM ? 'PM' : 'AM'}`;
};

export const formatDateSeparator = (timestamp: FirebaseFirestoreTypes.Timestamp | undefined): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, today)) {
    return 'Today';
  } else if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  } else {
    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatCallDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  } else {
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
};

export const needsDateSeparator = (
  currentMsg: FirebaseFirestoreTypes.Timestamp | undefined,
  previousMsg: FirebaseFirestoreTypes.Timestamp | undefined
): boolean => {
  if (!currentMsg || !previousMsg) return true;
  
  const currentDate = currentMsg.toDate();
  const previousDate = previousMsg.toDate();
  
  return !isSameDay(currentDate, previousDate);
};

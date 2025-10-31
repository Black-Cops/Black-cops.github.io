import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ChatPreview } from '../types';
import { formatChatListTime, formatDateSeparator } from '../utils/timeUtils';

interface ChatListItemProps {
  chat: ChatPreview;
  currentUserId: string;
  onPress: () => void;
  onCallPress: () => void;
  onLongPress?: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  currentUserId,
  onPress,
  onCallPress,
  onLongPress,
}) => {
  const otherParticipants = chat.participantProfiles.filter((user) => user.uid !== currentUserId);
  const primaryParticipant = otherParticipants[0] ?? chat.participantProfiles[0];

  const unread = chat.unreadCount > 0;
  const lastMessage = chat.lastMessage;

  let previewText = '';
  if (lastMessage) {
    if (lastMessage.messageType === 'call' && lastMessage.callInfo) {
      const { callType, status } = lastMessage.callInfo;
      const icon = callType === 'voice' ? 'phone' : 'video';
      const statusText = status === 'missed' ? 'Missed call' : status === 'ended' ? 'Call' : status;
      previewText = `${statusText} · ${callType === 'voice' ? 'Voice' : 'Video'}`;
    } else if (lastMessage.replyTo) {
      previewText = `${lastMessage.senderName}: ${lastMessage.body}`;
    } else {
      previewText = `${lastMessage.senderName}: ${lastMessage.body}`;
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: primaryParticipant?.avatarUrl || 'https://ui-avatars.com/api/?background=1f6feb&color=fff' }}
          style={styles.avatar}
        />
        {primaryParticipant?.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.username, unread && styles.usernameUnread]} numberOfLines={1}>
            {chat.chatType === 'group' ? chat.name : primaryParticipant?.username}
          </Text>
          <View style={styles.timeContainer}>
            {chat.lastActivityAt && (
              <Text style={[styles.time, unread && styles.timeUnread]}>
                {formatChatListTime(chat.lastActivityAt)}
              </Text>
            )}
            {chat.lastActivityAt && (
              <Text style={styles.date}>{formatDateSeparator(chat.lastActivityAt)}</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.previewContainer}>
            {lastMessage?.status === 'read' && (
              <Icon name="check-all" size={18} color="#25D366" style={styles.tickIcon} />
            )}
            {lastMessage?.status === 'delivered' && (
              <Icon name="check-all" size={18} color="#8B949E" style={styles.tickIcon} />
            )}
            {lastMessage?.status === 'sent' && (
              <Icon name="check" size={18} color="#8B949E" style={styles.tickIcon} />
            )}
            <Text style={[styles.previewText, unread && styles.previewUnread]} numberOfLines={1}>
              {previewText}
            </Text>
          </View>

          <View style={styles.actions}>
            {chat.callBadge === 'missed' && (
              <Icon name="phone-missed" size={18} color="#F85149" style={styles.callBadge} />
            )}
            {chat.callBadge === 'active' && (
              <Icon name="phone" size={18} color="#25D366" style={styles.callBadge} />
            )}
            <TouchableOpacity style={styles.callButton} onPress={onCallPress}>
              <Icon name="phone" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {unread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{chat.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0D1117',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#0D1117',
  },
  content: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#161B22',
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#E6EDF3',
    fontWeight: '600',
    flex: 1,
  },
  usernameUnread: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    color: '#8B949E',
  },
  timeUnread: {
    color: '#25D366',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#8B949E',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#8B949E',
    flex: 1,
  },
  previewUnread: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tickIcon: {
    marginRight: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callBadge: {
    marginRight: 4,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#0D1117',
    fontWeight: '700',
  },
});

export default ChatListItem;

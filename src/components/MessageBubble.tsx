import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Message } from '../types';
import { formatMessageTime } from '../utils/timeUtils';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  onLongPress?: () => void;
  onReplyPress?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onLongPress,
  onReplyPress,
}) => {
  const renderStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (message.status === 'read') {
      return <Icon name="check-all" size={18} color="#25D366" style={styles.statusIcon} />;
    }

    if (message.status === 'delivered') {
      return <Icon name="check-all" size={18} color="#8B949E" style={styles.statusIcon} />;
    }

    return <Icon name="check" size={18} color="#8B949E" style={styles.statusIcon} />;
  };

  const renderReply = () => {
    if (!message.replyTo) return null;
    return (
      <TouchableOpacity style={styles.replyContainer} onPress={onReplyPress}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={styles.replySender} numberOfLines={1}>
            {message.replyTo.senderName}
          </Text>
          <Text style={styles.replyPreview} numberOfLines={1}>
            {message.replyTo.preview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (message.messageType === 'call' && message.callInfo) {
      return (
        <View style={styles.callContainer}>
          <Icon
            name={message.callInfo.callType === 'voice' ? 'phone' : 'video'}
            size={20}
            color="#25D366"
            style={styles.callIcon}
          />
          <View>
            <Text style={styles.callTitle}>
              {message.callInfo.callType === 'voice' ? 'Voice call' : 'Video call'}
            </Text>
            <Text style={styles.callSubtitle}>
              {message.callInfo.status === 'missed'
                ? 'Missed call'
                : message.callInfo.status === 'ended'
                ? 'Call ended'
                : message.callInfo.status}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text style={[styles.messageText, !isOwnMessage && styles.messageTextOther]}>
        {message.body}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={onLongPress}
      style={[styles.container, isOwnMessage ? styles.alignEnd : styles.alignStart]}>
      <View
        style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}
      >
        {renderReply()}
        {renderContent()}
        <View style={styles.footerRow}>
          <Text style={styles.time}>{formatMessageTime(message.createdAt)}</Text>
          {renderStatusIcon()}
        </View>
      </View>
      {message.reactions && message.reactions.length > 0 && (
        <View style={[styles.reactionsContainer, isOwnMessage ? styles.reactionsRight : styles.reactionsLeft]}>
          {message.reactions.map((reaction) => (
            <View key={`${reaction.emoji}-${reaction.userId}`} style={styles.reactionBadge}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  ownBubble: {
    backgroundColor: '#005C4B',
  },
  otherBubble: {
    backgroundColor: '#1F2937',
  },
  messageText: {
    fontSize: 16,
    color: '#E6EDF3',
  },
  messageTextOther: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#B0B8C1',
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reactionsLeft: {
    marginLeft: 16,
  },
  reactionsRight: {
    marginRight: 16,
  },
  reactionBadge: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  replyContainer: {
    marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
  },
  replyBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#25D366',
    marginRight: 6,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    fontSize: 12,
    color: '#A0AFC0',
    fontWeight: '600',
  },
  replyPreview: {
    fontSize: 12,
    color: '#E6EDF3',
  },
  callContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    marginRight: 8,
  },
  callTitle: {
    fontSize: 16,
    color: '#E6EDF3',
    fontWeight: '600',
  },
  callSubtitle: {
    fontSize: 12,
    color: '#B0B8C1',
  },
});

export default MessageBubble;

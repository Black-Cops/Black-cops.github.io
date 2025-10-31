import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppContext } from '../context/AppContext';
import {
  listenToMessages,
  fetchMoreMessages,
  sendMessage,
  setTypingState,
  listenToTypingState,
  updateMessageStatus,
  toggleReaction,
  deleteMessage,
} from '../services/firestoreService';
import MessageBubble from '../components/MessageBubble';
import type { Message, ChatPreview } from '../types';
import { formatDateSeparator, needsDateSeparator } from '../utils/timeUtils';

const MESSAGES_LIMIT = 50;

const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chatId, chat } = route.params as { chatId: string; chat?: ChatPreview };
  const { currentUser } = useAppContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherParticipant =
    chat?.participantProfiles.find((user) => user.uid !== currentUser?.uid) ??
    chat?.participantProfiles[0];

  useEffect(() => {
    if (!chatId) return;

    const unsubscribeMessages = listenToMessages(chatId, MESSAGES_LIMIT, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    const unsubscribeTyping = listenToTypingState(chatId, (states) => {
      const typing = states
        .filter((s) => s.userId !== currentUser?.uid && s.isTyping)
        .map((s) => s.username);
      setTypingUsers(typing);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, currentUser?.uid]);

  useEffect(() => {
    if (messages.length === 0) return;

    messages.forEach((msg) => {
      if (msg.senderId !== currentUser?.uid) {
        if (!msg.readBy.includes(currentUser?.uid ?? '')) {
          updateMessageStatus(chatId, msg.id, 'readBy', currentUser?.uid ?? '');
        } else if (!msg.deliveredTo.includes(currentUser?.uid ?? '')) {
          updateMessageStatus(chatId, msg.id, 'deliveredTo', currentUser?.uid ?? '');
        }
      }
    });
  }, [messages, chatId, currentUser?.uid]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;

    setLoadingMore(true);
    const oldestMessage = messages[0];
    const olderMessages = await fetchMoreMessages(chatId, oldestMessage, MESSAGES_LIMIT);

    if (olderMessages.length > 0) {
      setMessages((prev) => [...olderMessages, ...prev]);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser) return;

    const messagePayload: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
      chatId,
      senderId: currentUser.uid,
      senderName: currentUser.username,
      body: inputText.trim(),
      messageType: 'text',
      status: 'sent',
      deliveredTo: [],
      readBy: [],
      reactions: [],
      replyTo: replyingTo
        ? {
            messageId: replyingTo.id,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderName,
            preview: replyingTo.body.substring(0, 50),
          }
        : undefined,
    };

    setInputText('');
    setReplyingTo(null);

    await sendMessage(chatId, messagePayload);

    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleTyping = (text: string) => {
    setInputText(text);

    if (!currentUser) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTypingState(chatId, currentUser.uid, {
      chatId,
      userId: currentUser.uid,
      username: currentUser.username,
      isTyping: true,
    });

    typingTimeoutRef.current = setTimeout(() => {
      setTypingState(chatId, currentUser.uid, {
        chatId,
        userId: currentUser.uid,
        username: currentUser.username,
        isTyping: false,
      });
    }, 2000);
  };

  const handleLongPress = (message: Message) => {
    const isOwnMessage = message.senderId === currentUser?.uid;

    const options = [
      'React',
      'Reply',
      'Copy',
      isOwnMessage ? 'Delete for Everyone' : 'Delete for Me',
      'Cancel',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: options.length - 2,
        },
        (buttonIndex) => {
          handleActionSelection(buttonIndex, message, isOwnMessage);
        }
      );
    } else {
      Alert.alert('Message Options', '', [
        { text: 'React', onPress: () => handleReaction(message) },
        { text: 'Reply', onPress: () => setReplyingTo(message) },
        { text: 'Copy', onPress: () => console.log('Copy:', message.body) },
        {
          text: isOwnMessage ? 'Delete for Everyone' : 'Delete for Me',
          onPress: () => deleteMessage(chatId, message.id, isOwnMessage, currentUser?.uid ?? ''),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleActionSelection = (index: number, message: Message, isOwnMessage: boolean) => {
    switch (index) {
      case 0:
        handleReaction(message);
        break;
      case 1:
        setReplyingTo(message);
        break;
      case 2:
        console.log('Copy:', message.body);
        break;
      case 3:
        deleteMessage(chatId, message.id, isOwnMessage, currentUser?.uid ?? '');
        break;
      default:
        break;
    }
  };

  const handleReaction = (message: Message) => {
    if (!currentUser) return;

    const emojis = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...emojis, 'Cancel'],
          cancelButtonIndex: emojis.length,
        },
        (buttonIndex) => {
          if (buttonIndex < emojis.length) {
            toggleReaction(chatId, message.id, {
              emoji: emojis[buttonIndex],
              userId: currentUser.uid,
              username: currentUser.username,
            });
          }
        }
      );
    } else {
      Alert.alert(
        'React to Message',
        'Select an emoji',
        emojis.map((emoji) => ({
          text: emoji,
          onPress: () =>
            toggleReaction(chatId, message.id, {
              emoji,
              userId: currentUser.uid,
              username: currentUser.username,
            }),
        })).concat([{ text: 'Cancel', style: 'cancel' }])
      );
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    const isAtBottom = offsetY + layoutHeight >= contentHeight - 100;
    setShowJumpToLatest(!isAtBottom);
  };

  const renderDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (needsDateSeparator(currentMessage.createdAt, previousMessage?.createdAt)) {
      return (
        <View style={styles.dateSeparatorContainer}>
          <Text style={styles.dateSeparatorText}>
            {formatDateSeparator(currentMessage.createdAt)}
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25D366" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E6EDF3" />
        </TouchableOpacity>

        <Image
          source={{ uri: otherParticipant?.avatarUrl || 'https://ui-avatars.com/api/?background=1f6feb&color=fff' }}
          style={styles.headerAvatar}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{otherParticipant?.username || 'Chat'}</Text>
          {typingUsers.length > 0 ? (
            <Text style={styles.headerSubtitle}>typing...</Text>
          ) : (
            <Text style={styles.headerSubtitle}>
              {otherParticipant?.isOnline ? 'online' : 'offline'}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate('Call', {
              chatId,
              calleeIds: [otherParticipant?.uid],
              callType: 'voice',
            })
          }>
          <Icon name="phone" size={22} color="#E6EDF3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate('Call', {
              chatId,
              calleeIds: [otherParticipant?.uid],
              callType: 'video',
            })
          }>
          <Icon name="video" size={22} color="#E6EDF3" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <>
            {renderDateSeparator(item, messages[index - 1])}
            <MessageBubble
              message={item}
              isOwnMessage={item.senderId === currentUser?.uid}
              onLongPress={() => handleLongPress(item)}
            />
          </>
        )}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.2}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        inverted={false}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#25D366" />
            </View>
          ) : null
        }
      />

      {showJumpToLatest && (
        <TouchableOpacity
          style={styles.jumpToLatestButton}
          onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}>
          <Icon name="chevron-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {replyingTo && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyBar} />
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewTitle}>
              Replying to {replyingTo.senderName}
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyingTo.body}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Icon name="close" size={24} color="#8B949E" />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#8B949E"
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}>
            <Icon name="send" size={22} color={inputText.trim() ? '#25D366' : '#8B949E'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderColor: '#30363D',
  },
  backButton: {
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E6EDF3',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8B949E',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  messagesList: {
    paddingVertical: 12,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#8B949E',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#161B22',
    borderTopWidth: 1,
    borderColor: '#30363D',
  },
  input: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#E6EDF3',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderColor: '#30363D',
  },
  replyBar: {
    width: 3,
    height: 40,
    borderRadius: 2,
    backgroundColor: '#25D366',
    marginRight: 8,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewTitle: {
    fontSize: 12,
    color: '#25D366',
    fontWeight: '600',
  },
  replyPreviewText: {
    fontSize: 14,
    color: '#E6EDF3',
  },
  loadingMoreContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  jumpToLatestButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ChatScreen;

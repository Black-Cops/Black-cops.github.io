import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { listenToChatPreviews, updatePresence } from '../services/firestoreService';
import { listenForIncomingCalls } from '../services/callService';
import { sendCallNotification } from '../services/notificationService';
import ChatListItem from '../components/ChatListItem';
import type { ChatPreview } from '../types';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { currentUser } = useAppContext();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    updatePresence(currentUser.uid, true);

    const unsubscribeChats = listenToChatPreviews(currentUser.uid, (updatedChats) => {
      const sortedChats = updatedChats.sort((a, b) => {
        const aTime = a.lastActivityAt?.toMillis() ?? 0;
        const bTime = b.lastActivityAt?.toMillis() ?? 0;
        return bTime - aTime;
      });
      setChats(sortedChats);
      setLoading(false);
    });

    const unsubscribeCalls = listenForIncomingCalls(
      currentUser.uid,
      (call, { answer, decline }) => {
        sendCallNotification(`Incoming Call`, call.callType, {
          callId: call.callId,
          chatId: call.chatId,
        });

        navigation.navigate('Call', { call, answer, decline });
      }
    );

    return () => {
      unsubscribeChats();
      unsubscribeCalls();
      if (currentUser?.uid) {
        updatePresence(currentUser.uid, false);
      }
    };
  }, [currentUser?.uid, navigation]);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(lowerQuery) ||
      chat.participantProfiles.some((user) =>
        user.username.toLowerCase().includes(lowerQuery)
      )
    );
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          if (currentUser?.uid) {
            await updatePresence(currentUser.uid, false);
          }
          await AsyncStorage.removeItem('userCredentials');
          await auth().signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: currentUser?.avatarUrl || 'https://ui-avatars.com/api/?background=1f6feb&color=fff' }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WhatsApp</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
            <Icon name="cog-outline" size={24} color="#E6EDF3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#E6EDF3" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#8B949E" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#8B949E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading chats...</Text>
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="message-text-outline" size={64} color="#30363D" />
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation with someone!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              currentUserId={currentUser?.uid ?? ''}
              onPress={() => navigation.navigate('Chat', { chatId: item.id, chat: item })}
              onCallPress={() => {
                const otherParticipant = item.participantProfiles.find(
                  (user) => user.uid !== currentUser?.uid
                );
                if (otherParticipant) {
                  navigation.navigate('Call', {
                    chatId: item.id,
                    calleeIds: [otherParticipant.uid],
                    callType: 'voice',
                  });
                }
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#161B22',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: '#161B22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#E6EDF3',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#161B22',
    marginLeft: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#8B949E',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B949E',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;

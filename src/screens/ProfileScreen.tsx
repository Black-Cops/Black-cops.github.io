import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { createOrUpdateUserProfile } from '../services/firestoreService';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { currentUser, setCurrentUser } = useAppContext();

  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    if (!username) {
      Alert.alert('Validation', 'Username is required');
      return;
    }

    setSaving(true);
    try {
      await createOrUpdateUserProfile(currentUser.uid, {
        ...currentUser,
        username,
        bio,
        phoneNumber,
      });

      setCurrentUser({
        ...currentUser,
        username,
        bio,
        phoneNumber,
      });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#E6EDF3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: currentUser?.avatarUrl || 'https://ui-avatars.com/api/?background=1f6feb&color=fff' }}
            style={styles.avatar}
          />
          <Text style={styles.statusText}>
            {currentUser?.isOnline ? 'Online' : 'Last seen recently'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#8B949E"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholder="Add a short bio"
            placeholderTextColor="#8B949E"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="Add a phone number"
            placeholderTextColor="#8B949E"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{currentUser?.email || 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Messages</Text>
            <Text style={styles.statValue}>{currentUser?.stats?.totalMessages ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calls</Text>
            <Text style={styles.statValue}>{currentUser?.stats?.totalCalls ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Missed</Text>
            <Text style={styles.statValue}>{currentUser?.stats?.missedCalls ?? 0}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#161B22',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6EDF3',
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#25D366',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#8B949E',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 8,
    padding: 14,
    color: '#E6EDF3',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  readonlyInput: {
    backgroundColor: '#161B22',
    borderRadius: 8,
    padding: 14,
  },
  readonlyText: {
    color: '#8B949E',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    color: '#E6EDF3',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#25D366',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;

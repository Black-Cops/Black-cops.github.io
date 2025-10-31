import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { updatePresence } from '../services/firestoreService';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { currentUser } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

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

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all cached data', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Success', 'Cache cleared successfully');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#E6EDF3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="bell" size={24} color="#25D366" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#8B949E', true: '#25D366' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="volume-high" size={24} color="#25D366" />
              <Text style={styles.settingText}>Sounds</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#8B949E', true: '#25D366' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="shield-check" size={24} color="#25D366" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="lock" size={24} color="#25D366" />
              <Text style={styles.settingText}>Security</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="account-lock" size={24} color="#25D366" />
              <Text style={styles.settingText}>Blocked Contacts</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA AND STORAGE</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Icon name="delete" size={24} color="#25D366" />
              <Text style={styles.settingText}>Clear Cache</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="folder" size={24} color="#25D366" />
              <Text style={styles.settingText}>Storage Usage</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="account" size={24} color="#25D366" />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Icon name="logout" size={24} color="#F85149" />
              <Text style={[styles.settingText, { color: '#F85149' }]}>Logout</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#8B949E" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for WhatsApp-style chat</Text>
        </View>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#8B949E',
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderColor: '#0D1117',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#E6EDF3',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#8B949E',
    marginVertical: 4,
  },
});

export default SettingsScreen;

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../services/firestoreService';
import type { UserProfile } from '../types';

interface AppContextType {
  firebaseUser: FirebaseAuthTypes.User | null;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType>({
  firebaseUser: null,
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
});

export const useAppContext = () => useContext(AppContext);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
      setFirebaseUser(authUser);

      if (!authUser) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(authUser.uid);
        setCurrentUser(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        const storedCredentials = await AsyncStorage.getItem('userCredentials');
        if (!auth().currentUser && storedCredentials) {
          const parsed = JSON.parse(storedCredentials);
          if (parsed?.email && parsed?.password) {
            await auth().signInWithEmailAndPassword(parsed.email, parsed.password);
          } else {
            await AsyncStorage.removeItem('userCredentials');
            setLoading(false);
          }
        } else if (!storedCredentials) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auto login failed:', error);
        await AsyncStorage.removeItem('userCredentials');
        setLoading(false);
      }
    };

    attemptAutoLogin();
  }, []);

  return (
    <AppContext.Provider value={{ firebaseUser, currentUser, setCurrentUser, loading }}>
      {children}
    </AppContext.Provider>
  );
};

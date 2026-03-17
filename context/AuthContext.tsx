import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of our AuthContext
type AuthType = {
  user: any;
  signIn: (userData: any) => void;
  signOut: () => void;
  loading: boolean;
};

// Create the context with default empty values
const AuthContext = createContext<AuthType>({
  user: null,
  signIn: () => {},
  signOut: () => {},
  loading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// The Provider component that wraps your app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // 1. Check for stored user when the app starts
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // 2. Protect Routes: Redirect users based on login status
  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (user && !inTabsGroup) {
      // If logged in but on Login page -> Go to Home
      router.replace('/(tabs)');
    } else if (!user && inTabsGroup) {
      // If NOT logged in but on Home page -> Kick to Login
      router.replace('/');
    }
  }, [user, loading, segments]);

  // 3. Login Function
  const signIn = async (userData: any) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    // The useEffect above will handle the redirect to /(tabs)
  };

  // 4. Logout Function (With Stack Reset)
  const signOut = async () => {
    try {
      // A. Clear State immediately so UI reacts
      setUser(null);
      
      // B. Clear Storage
      await AsyncStorage.removeItem('user');
      
      // C. Force Navigation Reset
      // This ensures the back button doesn't take you back to the profile
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
      
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Use our new hook

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn } = useAuth(); // Get the signIn function
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between SignUp/Login

const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_ID',
    iosClientId: '598470788920-53f9vepluh6ecsudb2j2lo39dtelrstn.apps.googleusercontent.com',
    webClientId: '598470788920-m7tq46co87ro72tt6f3m46l04d1jk08d3.apps.googleusercontent.com',
    // 1. Force the Proxy URI
    redirectUri: 'https://auth.expo.io/@vanshdhillon/sparkle-ai'
  });

  // 2. Add this EFFECT to spy on the URI
  useEffect(() => {
    if (request) {
      console.log("---------------------------------------------");
      console.log("⚠️ COPY THIS LINK INTO GOOGLE CONSOLE (WEB CLIENT ID):");
      console.log(request.redirectUri);
      console.log("---------------------------------------------");
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // In a real app, you'd fetch user details from Google here
      // For now, we just save a dummy user object
      signIn({ token: authentication?.accessToken, email: 'user@gmail.com' });
    }
  }, [response]);

  const handleGoogleAuth = () => {
    if (!request) {
      // DEV BYPASS: If no keys, just log them in instantly
      signIn({ name: 'Vansh (Dev)', email: 'dev@sparkle.ai' });
      return;
    }
    promptAsync();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header / Logo Section */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <View style={{
          width: 100, height: 100, backgroundColor: '#5B21B6', borderRadius: 30,
          alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          elevation: 8
        }}>
          <Text style={{ color: 'white', fontSize: 56, fontWeight: 'bold' }}>S</Text>
        </View>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
          {isLoginMode ? 'Welcome Back!' : 'Create Account'}
        </Text>
        <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40 }}>
          {isLoginMode 
            ? 'Login to access your portfolio and reports.' 
            : 'Join Sparkle AI to start your investing journey.'}
        </Text>
      </View>

      {/* Auth Buttons Section */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 60 }}>
        
        {/* Main Google Button */}
        <TouchableOpacity 
          onPress={handleGoogleAuth}
          style={{
            backgroundColor: 'white', borderWidth: 2, borderColor: '#E5E7EB',
            borderRadius: 16, paddingVertical: 16, flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 2
          }}
        >
          <Text style={{ fontSize: 22, marginRight: 12 }}>🔐</Text>
          <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 17 }}>
            {isLoginMode ? 'Login with Google' : 'Sign up with Google'}
          </Text>
        </TouchableOpacity>

        {/* Toggle between Login / Sign Up */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: '#6B7280' }}>
            {isLoginMode ? "New to Sparkle AI? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={{ color: '#5B21B6', fontWeight: 'bold' }}>
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hidden Bypass (Tap the version number at bottom) */}
        <TouchableOpacity 
          onPress={() => signIn({ name: 'Bypass User' })}
          style={{ marginTop: 40, alignItems: 'center', opacity: 0.3 }}
        >
          <Text style={{ fontSize: 10, color: '#9CA3AF' }}>v1.0.0 (Tap to Bypass)</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
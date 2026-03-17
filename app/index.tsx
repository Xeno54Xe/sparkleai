import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext'; //

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn } = useAuth(); //
  const [isLoginMode, setIsLoginMode] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_ID',
    iosClientId: '598470788920-53f9vepluh6ecsudb2j2lo39dtelrstn.apps.googleusercontent.com',
    webClientId: '598470788920-m7tq46co87ro72tt6f3m46l04d1jk08d3.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@vanshdhillon/sparkle-ai'
  });

  const getUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await response.json();
      signIn(user); //
    } catch (error) {
      console.log("Failed to fetch user data", error);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleAuth = () => {
    if (!request) {
      // Automatic bypass if keys are missing
      handleBypass();
      return;
    }
    promptAsync();
  };

  const handleBypass = () => {
    signIn({ 
      name: 'Vansh Dhillon (Dev)', 
      email: 'dev@sparkle.ai',
      picture: 'https://ui-avatars.com/api/?name=Vansh+Dhillon&background=5B21B6&color=fff' 
    }); //
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      
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

      <View style={{ paddingHorizontal: 32, paddingBottom: 40 }}>
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

        {/* --- THE BYPASS LOGIN BUTTON --- */}
        <TouchableOpacity 
          onPress={handleBypass}
          style={{ marginTop: 40, alignItems: 'center', opacity: 0.4 }}
        >
          <Text style={{ fontSize: 11, color: '#9CA3AF', textDecorationLine: 'underline' }}>
            v1.0.4 (Bypass Login for Testing)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
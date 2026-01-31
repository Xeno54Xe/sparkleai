import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    // For now, just navigate to home - we'll add real Google auth later
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Section with Branding */}
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 32,
        paddingTop: 60
      }}>
        {/* Logo */}
        <View style={{
          width: 100,
          height: 100,
          backgroundColor: '#5B21B6',
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          shadowColor: '#5B21B6',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8
        }}>
          <Text style={{ color: 'white', fontSize: 56, fontWeight: 'bold' }}>S</Text>
        </View>

        {/* App Name */}
        <Text style={{ 
          fontSize: 40, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Sparkle AI
        </Text>
        
        <Text style={{ 
          fontSize: 20, 
          color: '#5B21B6',
          marginBottom: 8,
          fontWeight: '600'
        }}>
          स्मार्ट निवेश, आसान तरीका
        </Text>
        
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 40,
          lineHeight: 24
        }}>
          India's AI-powered stock advisor{'\n'}for beginners
        </Text>

        {/* Features */}
        <View style={{ width: '100%', marginBottom: 20 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            padding: 16,
            borderRadius: 16,
            marginBottom: 12
          }}>
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#EDE9FE',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Text style={{ fontSize: 24 }}>🎯</Text>
            </View>
            <Text style={{ 
              color: '#374151', 
              flex: 1,
              fontSize: 15,
              lineHeight: 20
            }}>
              AI-powered Buy/Sell/Hold recommendations
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            padding: 16,
            borderRadius: 16,
            marginBottom: 12
          }}>
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#EDE9FE',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Text style={{ fontSize: 24 }}>📊</Text>
            </View>
            <Text style={{ 
              color: '#374151', 
              flex: 1,
              fontSize: 15,
              lineHeight: 20
            }}>
              Real-time sentiment & ESG analysis
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            padding: 16,
            borderRadius: 16
          }}>
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#EDE9FE',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Text style={{ fontSize: 24 }}>💰</Text>
            </View>
            <Text style={{ 
              color: '#374151', 
              flex: 1,
              fontSize: 15,
              lineHeight: 20
            }}>
              DCF valuation & detailed reports
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Section with Login Button */}
      <View style={{ 
        paddingHorizontal: 32, 
        paddingBottom: 48,
        paddingTop: 20
      }}>
        {/* Google Sign In Button */}
        <TouchableOpacity 
          onPress={handleGoogleLogin}
          style={{
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: '#E5E7EB',
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            marginBottom: 16
          }}
        >
          <Text style={{ fontSize: 22, marginRight: 12 }}>🔐</Text>
          <Text style={{ 
            color: '#1F2937', 
            fontWeight: '600', 
            fontSize: 17
          }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Skip for now button */}
        <TouchableOpacity 
          onPress={handleGoogleLogin}
          style={{
            backgroundColor: '#5B21B6',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center'
          }}
        >
          <Text style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: 17
          }}>
            Explore App
          </Text>
        </TouchableOpacity>
        
        <Text style={{ 
          textAlign: 'center', 
          color: '#9CA3AF', 
          fontSize: 12, 
          marginTop: 16,
          lineHeight: 18
        }}>
          By continuing, you agree to our{'\n'}Terms of Service & Privacy Policy
        </Text>
      </View>
    </View>
  );
}
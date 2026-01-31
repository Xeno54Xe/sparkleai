import { StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }) {
  const handleGoogleLogin = () => {
    // For now, just navigate to home - we'll add real auth later
    navigation.navigate('Home');
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Top Section with Logo */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo/Icon */}
        <View className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl items-center justify-center mb-6">
          <Text className="text-white text-5xl font-bold">S</Text>
        </View>
        
        {/* App Name */}
        <Text className="text-4xl font-bold text-gray-800 mb-2">Sparkle AI</Text>
        <Text className="text-lg text-gray-500 mb-2">स्मार्ट निवेश, आसान तरीका</Text>
        <Text className="text-base text-gray-400 text-center mb-8">
          India's AI-powered stock advisor for beginners
        </Text>

        {/* Features */}
        <View className="w-full space-y-3 mb-8">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🎯</Text>
            <Text className="text-gray-700 flex-1">AI-powered Buy/Sell/Hold recommendations</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📊</Text>
            <Text className="text-gray-700 flex-1">Real-time sentiment analysis</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">💰</Text>
            <Text className="text-gray-700 flex-1">DCF valuation & detailed reports</Text>
          </View>
        </View>
      </View>

      {/* Bottom Section with Login Button */}
      <View className="px-8 pb-12">
        <TouchableOpacity 
          onPress={handleGoogleLogin}
          className="bg-white border-2 border-gray-300 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
        >
          <Text className="text-xl mr-3">🔐</Text>
          <Text className="text-gray-800 font-semibold text-lg">Continue with Google</Text>
        </TouchableOpacity>
        
        <Text className="text-center text-gray-400 text-xs mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}
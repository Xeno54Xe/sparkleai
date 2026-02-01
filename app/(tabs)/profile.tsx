import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Context

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme(); // Get the theme state and toggler
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => signOut() 
        }
      ]
    );
  };

  // Dynamic Styles based on Theme
  const bgColor = isDark ? '#111827' : '#F9FAFB'; // Dark Gray vs Light Gray
  const cardColor = isDark ? '#1F2937' : 'white';
  const textColor = isDark ? '#F3F4F6' : '#1F2937';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      
      {/* Header / User Info Card */}
      <View style={{ backgroundColor: '#5B21B6', paddingTop: 60, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        {/* Avatar Placeholder */}
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }}>
          <Text style={{ fontSize: 40 }}>👤</Text>
        </View>
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
          {user?.name || "Sparkle User"}
        </Text>
        <Text style={{ fontSize: 14, color: '#DDD6FE', marginTop: 4 }}>
          {user?.email || "user@sparkle.ai"}
        </Text>
        
        <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
             <Text style={{ color: '#E9D5FF', fontSize: 12, fontWeight: '600' }}>Free Plan</Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16, marginLeft: 4 }}>
          Settings
        </Text>

        {/* General Settings Card */}
        <View style={{ backgroundColor: cardColor, borderRadius: 16, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 }}>
          
          <SettingItem 
            icon="🔔" 
            title="Notifications" 
            value={true} 
            isSwitch 
            textColor={textColor}
          />
          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6' }} />
          
          {/* THE DARK MODE SWITCH */}
          <SettingItem 
            icon="🌙" 
            title="Dark Mode" 
            value={isDark}        // <--- Controlled by Context
            isSwitch 
            onToggle={toggleTheme} // <--- Triggers the change
            textColor={textColor}
          />
          
          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6' }} />
          <SettingItem icon="🔒" title="Privacy & Security" textColor={textColor} />
          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6' }} />
          <SettingItem icon="🌐" title="Language" subtext="English" textColor={textColor} />

        </View>

        {/* Support Section */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16, marginLeft: 4 }}>
          Support
        </Text>
        <View style={{ backgroundColor: cardColor, borderRadius: 16, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 30 }}>
          <SettingItem icon="❓" title="Help Center" textColor={textColor} />
          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6' }} />
          <SettingItem icon="⭐" title="Rate Sparkle AI" textColor={textColor} />
          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6' }} />
          <SettingItem icon="📄" title="Terms & Conditions" textColor={textColor} />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={{ backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' }}
        >
          <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 16 }}>
            Log Out
          </Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: subTextColor, fontSize: 12, marginTop: 24, marginBottom: 40 }}>
          Sparkle AI v1.0.0
        </Text>

      </View>
    </ScrollView>
  );
}

// ------------------------------------------------------------
// FIXED HELPER COMPONENT (Handles the Switch Click correctly)
// ------------------------------------------------------------
function SettingItem({ icon, title, subtext, isSwitch, value, onToggle, textColor }: any) {
  return (
    <TouchableOpacity 
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 }}
      disabled={isSwitch} // If it's a switch, clicking the row shouldn't do anything, only the switch itself
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 20, marginRight: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: textColor || '#374151', fontWeight: '500' }}>{title}</Text>
      </View>
      
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onToggle} // <--- THIS WAS THE KEY FIX
          trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }}
          thumbColor={"white"}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {subtext && <Text style={{ color: '#9CA3AF', marginRight: 8 }}>{subtext}</Text>}
          <Text style={{ color: '#D1D5DB', fontSize: 18 }}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
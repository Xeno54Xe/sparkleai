import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'; // Added Image import
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// --- TEAM DATA ---
const TEAM_MEMBERS = [
  { id: 'm1', name: 'Dr. Aditya Sharma', role: 'Project Mentor', linkedin: 'https://www.linkedin.com/in/aditya-sharma-b2182515/', isMentor: true },
  { id: 'd1', name: 'Vansh Dhillon', role: 'Lead Developer', linkedin: 'https://linkedin.com/in/vanshdhillon', isMentor: false },
  { id: 'd2', name: 'Jairam Ayyar', role: 'NLP Engineer', linkedin: 'https://www.linkedin.com/in/jairam-ayyar/', isMentor: false },
  { id: 'd3', name: 'Annirudh Potukuchi', role: 'DCF Engineer', linkedin: 'https://www.linkedin.com/in/anirudh-potukuchi-0493b9263/', isMentor: false },
  { id: 'd4', name: 'Krish Bhatnagar', role: 'Sentiment Analysis Scientist', linkedin: 'https://www.linkedin.com/in/krish-bhatnagar-6b8024328/', isMentor: false },
  { id: 'd5', name: 'Rishit', role: 'UI/UX Designer', linkedin: 'https://www.linkedin.com/in/rissin09/', isMentor: false },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => signOut() }
    ]);
  };

  // Dynamic Styles
  const bgColor = isDark ? '#111827' : '#F9FAFB';
  const cardColor = isDark ? '#1F2937' : 'white';
  const textColor = isDark ? '#F3F4F6' : '#1F2937';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = '#8B5CF6'; 

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }} showsVerticalScrollIndicator={false}>
      
      {/* Header / User Info Card */}
      <View style={{ backgroundColor: '#5B21B6', paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        
        {/* 1. Dynamic Google Profile Picture */}
        <View style={{ marginBottom: 16 }}>
          {user?.picture ? (
            <Image 
              source={{ uri: user.picture }} 
              style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }}
            />
          ) : (
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Text style={{ fontSize: 40, color: 'white' }}>{user?.name?.charAt(0) || "👤"}</Text>
            </View>
          )}
        </View>
        
        {/* 2. Real Name & Email (No Fallbacks) */}
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
          {user?.name}
        </Text>
        <Text style={{ fontSize: 14, color: '#DDD6FE', marginTop: 4 }}>
          {user?.email}
        </Text>

        {/* 3. Removed "Free Plan" Section completely */}
      </View>

      <View style={{ padding: 20 }}>

        {/* --- TEAM SECTION --- */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16, marginLeft: 4 }}>
          Meet the Team
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30, marginHorizontal: -20, paddingHorizontal: 20 }}>
          {TEAM_MEMBERS.map((member) => (
            <View 
              key={member.id} 
              style={{ 
                backgroundColor: cardColor, 
                width: 150, 
                padding: 16, 
                borderRadius: 20, 
                marginRight: 12,
                alignItems: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
              }}
            >
              {/* PFP Placeholder for Team */}
              <View style={{ 
                width: 50, height: 50, borderRadius: 25, 
                backgroundColor: member.isMentor ? '#FEF3C7' : '#E0E7FF', 
                justifyContent: 'center', alignItems: 'center', marginBottom: 10 
              }}>
                <Text style={{ fontSize: 22 }}>{member.isMentor ? '🎓' : '👨‍💻'}</Text>
              </View>

              <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginBottom: 2 }} numberOfLines={1}>
                {member.name}
              </Text>
              <Text style={{ color: member.isMentor ? '#D97706' : accentColor, fontSize: 10, fontWeight: '600', marginBottom: 10, textAlign: 'center' }}>
                {member.role}
              </Text>

              {/* LinkedIn Logo Button */}
              <TouchableOpacity 
                onPress={() => Linking.openURL(member.linkedin)}
                activeOpacity={0.7}
                style={{ marginTop: 2 }}
              >
                <Ionicons name="logo-linkedin" size={28} color="#0077B5" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* --- SETTINGS SECTION --- */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16, marginLeft: 4 }}>
          Settings
        </Text>

        <View style={{ backgroundColor: cardColor, borderRadius: 16, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 }}>
          <SettingItem icon="🔔" title="Notifications" value={true} isSwitch textColor={textColor} />
          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6' }} />
          <SettingItem icon="🌙" title="Dark Mode" value={isDark} isSwitch onToggle={toggleTheme} textColor={textColor} />
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
          <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 16 }}>Log Out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: subTextColor, fontSize: 12, marginTop: 24, marginBottom: 40 }}>
          Sparkle AI v1.0.0
        </Text>

      </View>
    </ScrollView>
  );
}

// Helper Component
function SettingItem({ icon, title, subtext, isSwitch, value, onToggle, textColor }: any) {
  return (
    <TouchableOpacity 
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 }}
      disabled={isSwitch} 
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 20, marginRight: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: textColor || '#374151', fontWeight: '500' }}>{title}</Text>
      </View>
      
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onToggle}
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
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Port of backend/server.py (5000 is taken by macOS AirPlay Receiver)
const STOCK_API_PORT = 5001;

// Resolve the stock API host:
// 1. EXPO_PUBLIC_API_URL if set (e.g. http://192.168.1.10:5001)
// 2. On web, the same host the page was served from
// 3. On a device/emulator, the LAN IP of the machine running Metro
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${STOCK_API_PORT}`;
  }

  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.10:8081"
  const host = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `http://${host}:${STOCK_API_PORT}`;
}

export const API_URL = resolveApiUrl();

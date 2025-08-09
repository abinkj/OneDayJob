import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserLocation } from '../types';

const USER_DATA_KEY = 'USER';

const deriveLocationString = (location: string | UserLocation | undefined): string | undefined => {
  if (!location) return undefined;
  if (typeof location === 'string') return location;
  const parts = [location.address, location.city, location.state, location.country].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
};

export const normalizeUser = (raw: any): User => {
  if (!raw || typeof raw !== 'object') return raw as User;

  const id = raw.id ?? raw._id ?? undefined;
  const phoneNumber = raw.phoneNumber ?? raw.phone ?? undefined;

  // Normalize profilePicture to string if `{ uri }` is provided
  const profilePicture = typeof raw.profilePicture === 'object' && raw.profilePicture?.uri
    ? raw.profilePicture.uri
    : raw.profilePicture;

  const locationString = deriveLocationString(raw.location);

  return {
    ...raw,
    id,
    _id: raw._id ?? id,
    phoneNumber,
    profilePicture,
    location: raw.location,
    locationText: locationString,
  } as User;
};

export const saveUserData = async (userData: User | any): Promise<void> => {
  try {
    const normalized = normalizeUser(userData);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(normalized, null, 2));
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    let data = await AsyncStorage.getItem(USER_DATA_KEY);
    if (!data) {
      // Backward compatibility: try legacy key
      const legacy = await AsyncStorage.getItem('user');
      if (legacy) {
        const parsedLegacy = normalizeUser(JSON.parse(legacy));
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(parsedLegacy, null, 2));
        await AsyncStorage.removeItem('user');
        return parsedLegacy;
      }
      return null;
    }
    const parsed = JSON.parse(data);
    return normalizeUser(parsed);
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

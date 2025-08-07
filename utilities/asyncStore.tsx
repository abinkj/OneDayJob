import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const USER_DATA_KEY = 'USER_DATA';

export const saveUserData = async (userData: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
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

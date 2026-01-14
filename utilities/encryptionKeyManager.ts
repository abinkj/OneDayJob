import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const MMKV_ENCRYPTION_KEY_STORAGE_KEY = 'mmkv_encryption_key';

/**
 * Generates a cryptographically secure random encryption key
 * @returns A 64-character hexadecimal string (256 bits)
 */
const generateSecureKey = async (): Promise<string> => {
    // Generate 32 random bytes (256 bits) for strong encryption
    const randomBytes = await Crypto.getRandomBytesAsync(32);

    // Convert to hexadecimal string
    const hexKey = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    return hexKey;
};

/**
 * Retrieves the MMKV encryption key from secure storage.
 * If no key exists, generates a new one and stores it securely.
 * 
 * @returns The encryption key as a string
 * @throws Error if key generation or storage fails
 */
export const getOrCreateEncryptionKey = async (): Promise<string> => {
    try {
        // Try to retrieve existing key from secure storage
        const existingKey = await SecureStore.getItemAsync(MMKV_ENCRYPTION_KEY_STORAGE_KEY);

        if (existingKey) {
            console.log('✅ MMKV encryption key loaded from secure storage');
            return existingKey;
        }

        // No existing key found - generate a new one
        console.log('🔑 Generating new MMKV encryption key...');
        const newKey = await generateSecureKey();

        // Store the key securely
        await SecureStore.setItemAsync(MMKV_ENCRYPTION_KEY_STORAGE_KEY, newKey, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        console.log('✅ New MMKV encryption key generated and stored securely');
        return newKey;

    } catch (error) {
        console.error('❌ Failed to get or create MMKV encryption key:', error);
        throw new Error('Failed to initialize secure storage encryption');
    }
};

/**
 * Deletes the stored encryption key (use with caution - will make existing data unreadable)
 * Only use this for testing or when you want to completely reset the app's encrypted storage
 */
export const deleteEncryptionKey = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(MMKV_ENCRYPTION_KEY_STORAGE_KEY);
        console.log('⚠️ MMKV encryption key deleted from secure storage');
    } catch (error) {
        console.error('Failed to delete encryption key:', error);
        throw error;
    }
};

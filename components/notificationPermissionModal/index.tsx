import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  visible,
  onClose,
}) => {
  const { permission, requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setIsRequesting(true);
      const granted = await requestPermission();
      
      if (granted) {
        onClose();
      } else {
        Alert.alert(
          'Notifications Disabled',
          'To receive important updates about your jobs and applications, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Error', 'Failed to request notification permission');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Don't show if permission is already granted
  if (permission?.granted) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={48} color={Colors.blue} />
          </View>
          
          <Text style={styles.title}>Stay Updated!</Text>
          <Text style={styles.description}>
            Get instant notifications about:
          </Text>
          
          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.blue} />
              <Text style={styles.benefitText}>Verification codes</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.blue} />
              <Text style={styles.benefitText}>Job application updates</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.blue} />
              <Text style={styles.benefitText}>New messages</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.blue} />
              <Text style={styles.benefitText}>Important job alerts</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleRequestPermission}
              disabled={isRequesting}
            >
              <Text style={styles.primaryButtonText}>
                {isRequesting ? 'Requesting...' : 'Enable Notifications'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSkip}
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.blue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.subGrey,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefits: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: Colors.blue,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.subGrey + '40',
  },
  secondaryButtonText: {
    color: Colors.subGrey,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NotificationPermissionModal;












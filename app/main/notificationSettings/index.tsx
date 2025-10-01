import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useNotifications } from '../../../contexts/NotificationContext';
import { 
  getNotificationSettings, 
  updateNotificationSettings,
  NotificationSettings 
} from '../../../services/notificationApi';

const NotificationSettingsScreen = () => {
  const { permission, requestPermission } = useNotifications();
  const [settings, setSettings] = useState<NotificationSettings>({
    verificationCodes: true,
    jobUpdates: true,
    applicationStatus: true,
    messages: true,
    systemUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      await updateNotificationSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      // Revert the change on error
      setSettings(settings);
      Alert.alert('Error', 'Failed to update notification setting');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'To receive notifications, please enable them in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderSettingItem = (
    key: keyof NotificationSettings,
    title: string,
    description: string,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon as any} size={24} color={Colors.blue} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={settings[key]}
          onValueChange={(value) => handleSettingChange(key, value)}
          disabled={saving}
          trackColor={{ false: Colors.subGrey + '40', true: Colors.blue + '40' }}
          thumbColor={settings[key] ? Colors.blue : Colors.subGrey}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <Text style={styles.headerSubtitle}>
          Choose what notifications you want to receive
        </Text>
      </View>

      {!permission?.granted && (
        <View style={styles.permissionBanner}>
          <Ionicons name="notifications-off" size={24} color={Colors.red} />
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Notifications Disabled</Text>
            <Text style={styles.permissionText}>
              Enable notifications to receive important updates
            </Text>
          </View>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
          >
            <Text style={styles.permissionButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Job Notifications</Text>
        
        {renderSettingItem(
          'verificationCodes',
          'Verification Codes',
          'Get notified when verification codes are generated',
          'key-outline'
        )}
        
        {renderSettingItem(
          'jobUpdates',
          'Job Updates',
          'Receive updates about your job postings',
          'briefcase-outline'
        )}
        
        {renderSettingItem(
          'applicationStatus',
          'Application Status',
          'Get notified about application status changes',
          'document-text-outline'
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Communication</Text>
        
        {renderSettingItem(
          'messages',
          'Messages',
          'Receive notifications for new messages',
          'chatbubble-outline'
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>System</Text>
        
        {renderSettingItem(
          'systemUpdates',
          'System Updates',
          'Receive important system notifications',
          'settings-outline'
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Notification preferences are synced across all your devices
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.subGrey,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.subGrey + '20',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.subGrey,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.red + '10',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
  },
  permissionContent: {
    flex: 1,
    marginLeft: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.red,
    marginBottom: 2,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.subGrey,
  },
  permissionButton: {
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.subGrey + '10',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.subGrey,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.subGrey,
    textAlign: 'center',
  },
});

export default NotificationSettingsScreen;

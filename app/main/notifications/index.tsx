import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { NotificationData } from '../../../services/notificationService';
import { createStyles } from './styles';

const NotificationScreen = () => {
  const {
    notifications,
    unreadCount,
    clearAllNotifications,
    markAsRead,
    refreshNotifications,
  } = useNotifications();

  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationData) => {
    // Mark as read
    if (notification.jobId) {
      markAsRead(notification.jobId);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'verification_code':
        if (notification.jobId) {
          // Navigate to job details or verification screen
          console.log('Navigate to verification for job:', notification.jobId);
        }
        break;
      case 'job_update':
        if (notification.jobId) {
          console.log('Navigate to job details:', notification.jobId);
        }
        break;
      case 'application_status':
        if (notification.jobId) {
          console.log('Navigate to job details:', notification.jobId);
        }
        break;
      case 'message':
        if (notification.data?.conversationId) {
          console.log('Navigate to chat:', notification.data.conversationId);
        }
        break;
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'arrival_status':
        return 'location-outline';
      case 'job_update':
        return 'briefcase-outline';
      case 'application_status':
        return 'document-text-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'system':
        return 'settings-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'arrival_status':
        return '#10B981';
      case 'job_update':
        return '#2196F3';
      case 'application_status':
        return '#FF9800';
      case 'message':
        return '#9C27B0';
      case 'system':
        return '#607D8B';
      default:
        return colors.blue;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => {
    const isUnread = !item.read;
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getNotificationIcon(item.type) as any}
                size={24}
                color={iconColor}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.notificationTitle, isUnread && styles.unreadText]}>
                {item.title}
              </Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.timestamp || new Date().toISOString())}
              </Text>
            </View>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color={colors.grey} />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You'll receive notifications about job updates, applications, and messages here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList bounces={false}
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.blue]}
            tintColor={colors.blue}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default NotificationScreen;


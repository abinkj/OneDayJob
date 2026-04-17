import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function SuspendedScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleContactSupport = () => {
    Linking.openURL('mailto:zoopol.india@gmail.com?subject=Account Suspension Query');
  };

  const handleLogout = () => {
    // Navigate back to login or start
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.red + '20' }]}>
          <Ionicons name="alert-circle" size={80} color={colors.red} />
        </View>
        
        <Text style={[styles.title, { color: colors.black }]}>Account Suspended</Text>
        
        <Text style={[styles.description, { color: colors.grey }]}>
          Your account has been suspended for violating our terms of service or safety guidelines.
        </Text>

        <View style={[styles.infoBox, { backgroundColor: colors.address2 }]}>
          <Text style={[styles.infoTitle, { color: colors.black }]}>What can I do?</Text>
          <Text style={[styles.infoText, { color: colors.grey }]}>
            If you believe this was a mistake, please reach out to our support team for a review.
          </Text>
          
          <TouchableOpacity 
            style={[styles.supportButton, { backgroundColor: colors.primary }]} 
            onPress={handleContactSupport}
          >
            <Ionicons name="mail-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.supportButtonText}>zoopol.india@gmail.com</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.primary }]}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  infoBox: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

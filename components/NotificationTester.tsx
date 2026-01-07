import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import notificationService from '../services/notificationService';
import { getAccessToken } from '../utilities/secureStore';

interface TestResult {
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: string;
}

export default function NotificationTester() {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<any>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiUrl, setApiUrl] = useState<string>('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const token = notificationService.getExpoPushToken();
            setPushToken(token);

            const perms = await notificationService.getNotificationPermissions();
            setPermissions(perms);

            setApiUrl(process.env.EXPO_PUBLIC_API_URL || 'Not set');
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const addTestResult = (test: string, status: 'success' | 'error', message: string) => {
        const result: TestResult = {
            test,
            status,
            message,
            timestamp: new Date().toLocaleTimeString(),
        };
        setTestResults((prev) => [result, ...prev]);
    };

    const testPermissions = async () => {
        setLoading(true);
        try {
            const perms = await notificationService.getNotificationPermissions();
            setPermissions(perms);

            if (perms.granted) {
                addTestResult('Permissions', 'success', 'Notification permissions granted');
            } else {
                addTestResult('Permissions', 'error', `Permissions not granted. Status: ${perms.status}`);
            }
        } catch (error: any) {
            addTestResult('Permissions', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testRequestPermissions = async () => {
        setLoading(true);
        try {
            const granted = await notificationService.requestNotificationPermissions();
            if (granted) {
                addTestResult('Request Permissions', 'success', 'Permissions granted');
                await loadInitialData();
            } else {
                addTestResult('Request Permissions', 'error', 'Permissions denied');
            }
        } catch (error: any) {
            addTestResult('Request Permissions', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testGetPushToken = async () => {
        setLoading(true);
        try {
            const token = await notificationService.ensureToken();
            setPushToken(token);

            if (token) {
                addTestResult('Push Token', 'success', `Token: ${token.substring(0, 30)}...`);
            } else {
                addTestResult('Push Token', 'error', 'Failed to get push token');
            }
        } catch (error: any) {
            addTestResult('Push Token', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testDeviceRegistration = async () => {
        setLoading(true);
        try {
            const success = await notificationService.registerDeviceWithBackend();
            if (success) {
                addTestResult('Device Registration', 'success', 'Device registered with backend');
            } else {
                addTestResult('Device Registration', 'error', 'Failed to register device');
            }
        } catch (error: any) {
            addTestResult('Device Registration', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testLocalNotification = async () => {
        setLoading(true);
        try {
            await notificationService.sendLocalNotification(
                '🧪 Test Local Notification',
                'This is a test local notification from NotificationTester',
                { type: 'test', timestamp: new Date().toISOString() }
            );
            addTestResult('Local Notification', 'success', 'Local notification sent');
        } catch (error: any) {
            addTestResult('Local Notification', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testBackendNotification = async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) {
                addTestResult('Backend Notification', 'error', 'No access token available');
                setLoading(false);
                return;
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type: 'test' }),
            });

            if (response.ok) {
                const data = await response.json();
                addTestResult('Backend Notification', 'success', 'Test notification sent from backend');
            } else {
                const errorText = await response.text();
                addTestResult('Backend Notification', 'error', `Backend error: ${response.status} - ${errorText}`);
            }
        } catch (error: any) {
            addTestResult('Backend Notification', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testVerificationCode = async () => {
        setLoading(true);
        try {
            await notificationService.sendVerificationCodeNotification(
                'test-job-123',
                'Test Job',
                '123456'
            );
            addTestResult('Verification Code', 'success', 'Verification code notification sent');
        } catch (error: any) {
            addTestResult('Verification Code', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testJobUpdate = async () => {
        setLoading(true);
        try {
            await notificationService.sendJobUpdateNotification(
                'test-job-123',
                'Test Job',
                'Job status has been updated'
            );
            addTestResult('Job Update', 'success', 'Job update notification sent');
        } catch (error: any) {
            addTestResult('Job Update', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const testMessage = async () => {
        setLoading(true);
        try {
            await notificationService.sendMessageNotification(
                'test-conversation-123',
                'Test User',
                'Hello! This is a test message.'
            );
            addTestResult('Message', 'success', 'Message notification sent');
        } catch (error: any) {
            addTestResult('Message', 'error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🔔 Notification System Tester</Text>

            {/* Status Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Current Status</Text>
                <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>API URL:</Text>
                    <Text style={styles.statusValue}>{apiUrl}</Text>
                </View>
                <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Permissions:</Text>
                    <Text style={[styles.statusValue, permissions?.granted ? styles.success : styles.error]}>
                        {permissions?.status || 'Unknown'}
                    </Text>
                </View>
                <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Push Token:</Text>
                    <Text style={[styles.statusValue, pushToken ? styles.success : styles.error]}>
                        {pushToken ? `${pushToken.substring(0, 30)}...` : 'Not available'}
                    </Text>
                </View>
            </View>

            {/* Setup Tests */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔧 Setup Tests</Text>
                <TouchableOpacity style={styles.button} onPress={testPermissions} disabled={loading}>
                    <Text style={styles.buttonText}>Check Permissions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testRequestPermissions} disabled={loading}>
                    <Text style={styles.buttonText}>Request Permissions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testGetPushToken} disabled={loading}>
                    <Text style={styles.buttonText}>Get Push Token</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testDeviceRegistration} disabled={loading}>
                    <Text style={styles.buttonText}>Register Device with Backend</Text>
                </TouchableOpacity>
            </View>

            {/* Notification Tests */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📬 Notification Tests</Text>
                <TouchableOpacity style={styles.button} onPress={testLocalNotification} disabled={loading}>
                    <Text style={styles.buttonText}>Test Local Notification</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testBackendNotification} disabled={loading}>
                    <Text style={styles.buttonText}>Test Backend Notification</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testVerificationCode} disabled={loading}>
                    <Text style={styles.buttonText}>Test Verification Code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testJobUpdate} disabled={loading}>
                    <Text style={styles.buttonText}>Test Job Update</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testMessage} disabled={loading}>
                    <Text style={styles.buttonText}>Test Message</Text>
                </TouchableOpacity>
            </View>

            {/* Test Results */}
            <View style={styles.section}>
                <View style={styles.resultsHeader}>
                    <Text style={styles.sectionTitle}>📋 Test Results</Text>
                    <TouchableOpacity onPress={clearResults}>
                        <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                </View>
                {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />}
                {testResults.length === 0 ? (
                    <Text style={styles.noResults}>No tests run yet</Text>
                ) : (
                    testResults.map((result, index) => (
                        <View key={index} style={styles.resultItem}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultTest}>{result.test}</Text>
                                <Text style={styles.resultTime}>{result.timestamp}</Text>
                            </View>
                            <Text
                                style={[
                                    styles.resultStatus,
                                    result.status === 'success' ? styles.success : styles.error,
                                ]}
                            >
                                {result.status === 'success' ? '✅' : '❌'} {result.message}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    statusItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statusValue: {
        fontSize: 14,
        flex: 1,
        textAlign: 'right',
        marginLeft: 8,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearButton: {
        color: '#007AFF',
        fontSize: 14,
    },
    loader: {
        marginVertical: 8,
    },
    noResults: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        paddingVertical: 16,
    },
    resultItem: {
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
        paddingLeft: 12,
        marginBottom: 12,
        paddingVertical: 8,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    resultTest: {
        fontSize: 16,
        fontWeight: '600',
    },
    resultTime: {
        fontSize: 12,
        color: '#999',
    },
    resultStatus: {
        fontSize: 14,
    },
    success: {
        color: '#34C759',
    },
    error: {
        color: '#FF3B30',
    },
});

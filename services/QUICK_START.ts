/**
 * QUICK START GUIDE - Offline Queue Integration
 * 
 * Copy-paste ready code snippets for integrating offline queue
 * into your existing components.
 */

// ============================================================================
// STEP 1: Import the helper functions
// ============================================================================

import {
    applyJobOffline,
    completeWorkerSessionOffline,
    createPaymentOrderOffline,
    useOfflineQueue,
    getOfflineQueueStatus,
    clearFailedRequests,
} from './services/offlineQueueExamples';

// ============================================================================
// STEP 2: Replace existing API calls
// ============================================================================

// ──────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Job Application
// ──────────────────────────────────────────────────────────────────────────

// BEFORE:
/*
const handleApplyJob = async () => {
  try {
    setLoading(true);
    await applyJob(jobId);
    Alert.alert('Success', 'Application submitted!');
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
*/

// AFTER:
const handleApplyJob = async () => {
    try {
        setLoading(true);
        const result = await applyJobOffline(jobId);

        if ('queued' in result && result.queued) {
            // Request was queued (offline)
            Alert.alert(
                'Queued',
                'You are offline. Your application will be submitted when you reconnect.',
                [{ text: 'OK' }]
            );
        } else {
            // Request succeeded immediately (online)
            Alert.alert('Success', 'Application submitted successfully!');
        }
    } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to apply for job');
    } finally {
        setLoading(false);
    }
};

// ──────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Complete Worker Session
// ──────────────────────────────────────────────────────────────────────────

// BEFORE:
/*
const handleCompleteSession = async () => {
  try {
    await completeWorkerSession(sessionId, notes);
    navigation.goBack();
  } catch (error) {
    showError(error.message);
  }
};
*/

// AFTER:
const handleCompleteSession = async () => {
    try {
        const result = await completeWorkerSessionOffline(sessionId, notes);

        if ('queued' in result && result.queued) {
            showToast('Session completion queued - will sync when online');
            navigation.goBack();
        } else {
            showToast('Session completed successfully!');
            navigation.goBack();
        }
    } catch (error: any) {
        showError(error.message || 'Failed to complete session');
    }
};

// ──────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Initiate Payment
// ──────────────────────────────────────────────────────────────────────────

// BEFORE:
/*
const handleInitiatePayment = async () => {
  try {
    const response = await createPaymentOrder(jobId);
    const { orderId, amount } = response.data;
    openPaymentGateway(orderId, amount);
  } catch (error) {
    Alert.alert('Error', 'Failed to initiate payment');
  }
};
*/

// AFTER:
const handleInitiatePayment = async () => {
    try {
        const result = await createPaymentOrderOffline(jobId);

        if ('queued' in result && result.queued) {
            Alert.alert(
                'Offline',
                'You are offline. Payment will be initiated when you reconnect.',
                [{ text: 'OK' }]
            );
        } else {
            // Payment order created successfully
            const { orderId, amount } = result.data;
            openPaymentGateway(orderId, amount);
        }
    } catch (error: any) {
        Alert.alert('Error', 'Failed to initiate payment');
    }
};

// ============================================================================
// STEP 3: Add Queue Status Indicator (Optional)
// ============================================================================

// Add this component to your app header or settings screen
const QueueStatusIndicator = () => {
    const { isOnline, hasPendingRequests, status } = useOfflineQueue();

    if (!hasPendingRequests) return null;

    return (
        <View style= { styles.queueIndicator } >
        <Text style={ styles.queueText }>
            { isOnline? '🔄 Syncing...': '📴 Offline' }
                ({ status.pendingRequests } pending)
            </Text>
            </View>
  );
};

// ============================================================================
// STEP 4: Add Settings/Debug Screen (Optional)
// ============================================================================

// Add this to your settings screen to show queue status
const QueueManagementSection = () => {
    const { status, hasFailedRequests } = useOfflineQueue();

    return (
        <View style= { styles.section } >
        <Text style={ styles.sectionTitle }> Offline Queue </Text>

            < View style = { styles.row } >
                <Text>Network Status: </Text>
                    < Text > { status.isOnline ? '🟢 Online' : '🔴 Offline' } </Text>
                    </View>

                    < View style = { styles.row } >
                        <Text>Pending Requests: </Text>
                            < Text > { status.pendingRequests } </Text>
                            </View>

                            < View style = { styles.row } >
                                <Text>Failed Requests: </Text>
                                    < Text > { status.failedRequests } </Text>
                                    </View>

    {
        hasFailedRequests && (
            <TouchableOpacity 
          style={ styles.button }
        onPress = { async() => {
    await clearFailedRequests();
    Alert.alert('Success', 'Failed requests cleared');
}}
        >
    <Text style={ styles.buttonText }> Clear Failed Requests </Text>
        </TouchableOpacity>
      )}
</View>
  );
};

// ============================================================================
// COMPLETE COMPONENT EXAMPLE
// ============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { applyJobOffline } from './services/offlineQueueExamples';

const JobDetailsScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [loading, setLoading] = useState(false);

    const handleApplyJob = async () => {
        try {
            setLoading(true);
            const result = await applyJobOffline(jobId);

            if ('queued' in result && result.queued) {
                Alert.alert(
                    'Queued',
                    'You are offline. Your application will be submitted when you reconnect.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert(
                    'Success',
                    'Application submitted successfully!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to apply for job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style= {{ flex: 1, padding: 20 }
}>
    {/* Your existing UI */ }

    < TouchableOpacity
style = {{
    backgroundColor: '#007AFF',
        padding: 15,
            borderRadius: 8,
                alignItems: 'center',
        }}
onPress = { handleApplyJob }
disabled = { loading }
    >
    <Text style={ { color: 'white', fontSize: 16, fontWeight: 'bold' } }>
        { loading? 'Applying...': 'Apply for Job' }
        </Text>
        </TouchableOpacity>
        </View>
  );
};

export default JobDetailsScreen;

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
✅ Test 1: Offline Queue
1. Enable airplane mode on device
2. Apply for a job
3. Verify "Queued" alert appears
4. Disable airplane mode
5. Verify application is submitted automatically

✅ Test 2: Online Direct
1. Ensure network is enabled
2. Apply for a job
3. Verify "Success" alert appears immediately

✅ Test 3: Persistence
1. Enable airplane mode
2. Apply for a job
3. Force close app
4. Reopen app
5. Disable airplane mode
6. Verify application is submitted

✅ Test 4: Duplicate Prevention
1. Enable airplane mode
2. Apply for same job 3 times
3. Disable airplane mode
4. Verify only ONE application is submitted
*/

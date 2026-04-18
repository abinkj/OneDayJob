import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../../constants/Colors';
import { useRouter } from 'expo-router';
import { createConversation } from '../../../../services/api';
import Toast from 'react-native-toast-message';

interface VerificationPendingViewProps {
    colors: ThemeColors;
    onRefresh: () => void;
    actionLoading?: boolean;
    forbiddenMessage?: string | null;
    employerId?: string;
    employerName?: string;
}

const VerificationPendingView: React.FC<VerificationPendingViewProps> = ({
    colors,
    onRefresh,
    actionLoading = false,
    forbiddenMessage,
    employerId,
    employerName
}) => {
    const router = useRouter();
    const [chatLoading, setChatLoading] = React.useState(false);

    const handleChat = async () => {
        if (!employerId) {
            Toast.show({
                type: 'info',
                text1: 'Contact Info Missing',
                text2: 'Could not find employer contact details.'
            });
            return;
        }

        try {
            setChatLoading(true);
            const response = await createConversation(employerId);
            if (response.data.success) {
                // Navigate to Chat screen using correct parameters
                router.push({
                    pathname: '/main/chatScreen',
                    params: {
                        conversationId: response.data.data._id,
                        participant: JSON.stringify({
                            id: employerId,
                            name: employerName || 'Employer'
                        })
                    }
                });
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to start chat with employer'
            });
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="time-outline" size={60} color={colors.primary} />
            </View>
            
            <Text style={[styles.title, { color: colors.black }]}>
                Waiting for Approval
            </Text>
            
            <Text style={[styles.description, { color: colors.grey }]}>
                {forbiddenMessage || "Your employer needs to verify your arrival before you can access the job timer."}
            </Text>
            
            <View style={[styles.infoCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.black }]}>
                    Please show your "Arrived" status to the employer and ask them to tap "Verify" on their dashboard.
                </Text>
            </View>

            {employerId && (
                <TouchableOpacity 
                    style={[styles.chatButton, { borderColor: colors.primary }]}
                    onPress={handleChat}
                    disabled={chatLoading}
                >
                    {chatLoading ? (
                        <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                        <>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.chatButtonText, { color: colors.primary }]}>
                                Chat with Employer
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            <TouchableOpacity 
                style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                onPress={onRefresh}
                disabled={actionLoading}
            >
                {actionLoading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.refreshButtonText}>Refresh Status</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        marginTop: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 25,
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: 13,
        marginLeft: 10,
        flex: 1,
        lineHeight: 18,
    },
    chatButton: {
        flexDirection: 'row',
        height: 50,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 12,
        borderWidth: 1.5,
    },
    chatButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    refreshButton: {
        flexDirection: 'row',
        height: 54,
        paddingHorizontal: 32,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VerificationPendingView;

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
    fallbackComponent?: (error: Error, resetError: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('🚨 Error Boundary Caught an Error');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error:', error);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Component Stack:', errorInfo.componentStack);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Store error info in state
        this.setState({ errorInfo });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // TODO: Send to error tracking service (Sentry, Bugsnag, etc.)
        // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallbackComponent && this.state.error) {
                return this.props.fallbackComponent(this.state.error, this.resetError);
            }

            // Default fallback UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        {/* Error Icon */}
                        <View style={styles.iconContainer}>
                            <Ionicons name="alert-circle" size={80} color="#FF6B6B" />
                        </View>

                        {/* Error Title */}
                        <Text style={styles.title}>Oops! Something went wrong</Text>

                        {/* Error Message */}
                        <Text style={styles.message}>
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </Text>

                        {/* Error Details (Development Mode) */}
                        {__DEV__ && this.state.error && (
                            <ScrollView style={styles.errorDetailsContainer}>
                                <Text style={styles.errorDetailsTitle}>Error Details (Dev Mode):</Text>
                                <Text style={styles.errorDetailsText}>
                                    {this.state.error.toString()}
                                </Text>
                                {this.state.error.stack && (
                                    <Text style={styles.errorStackText}>
                                        {this.state.error.stack}
                                    </Text>
                                )}
                            </ScrollView>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={this.resetError}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                <Text style={styles.primaryButtonText}>Try Again</Text>
                            </TouchableOpacity>

                            {/* Optional: Add a "Go Home" button if needed */}
                            {/* <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  this.resetError();
                  // Navigate to home - you'd need to pass navigation as prop
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </TouchableOpacity> */}
                        </View>

                        {/* Help Text */}
                        <Text style={styles.helpText}>
                            If this problem persists, please contact support
                        </Text>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        maxWidth: 400,
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#FFE5E5',
        borderRadius: 100,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    errorDetailsContainer: {
        maxHeight: 200,
        width: '100%',
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FFE5E5',
    },
    errorDetailsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#E74C3C',
        marginBottom: 8,
    },
    errorDetailsText: {
        fontSize: 12,
        color: '#C0392B',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    errorStackText: {
        fontSize: 10,
        color: '#95A5A6',
        fontFamily: 'monospace',
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#3498DB',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#ECF0F1',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#2C3E50',
        fontSize: 16,
        fontWeight: '600',
    },
    helpText: {
        fontSize: 14,
        color: '#95A5A6',
        textAlign: 'center',
        marginTop: 24,
    },
});

export default ErrorBoundary;

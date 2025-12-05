import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface RatingModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    isSubmitting: boolean;
    workerName: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
    isVisible,
    onClose,
    onSubmit,
    isSubmitting,
    workerName
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        try {
            await onSubmit(rating, comment);
            // Reset state after successful submission
            setRating(0);
            setComment('');
            setError('');
        } catch (err) {
            // Error handling is done in the parent component
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setRating(0);
            setComment('');
            setError('');
            onClose();
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalContainer}>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Rate Worker</Text>
                                    <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
                                        <Ionicons name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.subtitle}>
                                    How was your experience with {workerName}?
                                </Text>

                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => {
                                                setRating(star);
                                                setError('');
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            <Ionicons
                                                name={star <= rating ? "star" : "star-outline"}
                                                size={40}
                                                color={star <= rating ? "#FFD700" : "#CCCCCC"}
                                                style={styles.star}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Write a review (optional)"
                                    multiline
                                    numberOfLines={4}
                                    value={comment}
                                    onChangeText={setComment}
                                    editable={!isSubmitting}
                                    textAlignVertical="top"
                                />

                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (rating === 0 || isSubmitting) && styles.disabledButton
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={rating === 0 || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Submit Rating</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    star: {
        marginHorizontal: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        height: 100,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default RatingModal;

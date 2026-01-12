import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SavedAddress } from '../../types';
import { LocationData } from '../../services/locationService';
import LocationSearch from '../LocationSearch';
import { createStyles } from './styles';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

interface AddEditAddressProps {
    visible: boolean;
    address?: SavedAddress | null;
    onClose: () => void;
    onSave: (address: Omit<SavedAddress, '_id' | 'createdAt'>) => Promise<void>;
}

const AddEditAddress: React.FC<AddEditAddressProps> = ({
    visible,
    address,
    onClose,
    onSave,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [isDefault, setIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [manualAddress, setManualAddress] = useState({
        building: '',
        street: '',
        landmark: ''
    });

    // Initialize form when editing an existing address
    useEffect(() => {
        if (address) {
            setLabel(address.label);
            setIsDefault(address.isDefault);
            // Convert SavedAddress to LocationData format
            setSelectedLocation({
                address: address.address,
                city: address.city,
                state: address.state,
                country: address.country,
                zipCode: address.zipCode || '',
                coordinates: {
                    latitude: address.coordinates.latitude,
                    longitude: address.coordinates.longitude,
                },
            });
        }
    }, [address]);

    // Reset form when modal opens for a new address
    useEffect(() => {
        if (visible && !address) {
            setLabel('Home');
            setSelectedLocation(null);
            setIsDefault(false);
            setManualAddress({ building: '', street: '', landmark: '' });
        }
    }, [visible, address]);

    const handleSave = async () => {
        if (!selectedLocation) {
            console.log('Cannot save: No location selected');
            return;
        }

        // Combine manual address fields if Google Places didn't provide full address
        const manualAddressStr = `${manualAddress.building} ${manualAddress.street}`.trim();
        const fullAddress = selectedLocation.address || manualAddressStr || selectedLocation.city;

        // Validation: ensure we have at least some address information
        if (!fullAddress || fullAddress === selectedLocation.city) {
            if (!manualAddress.building && !manualAddress.street) {
                console.log('Validation failed: Please enter building or street');
                Toast.show({
                    type: 'error',
                    text1: 'Address Required',
                    text2: 'Please enter building number or street name',
                });
                return;
            }
        }

        const payload = {
            label,
            address: fullAddress,
            city: selectedLocation.city,
            state: selectedLocation.state,
            country: selectedLocation.country,
            zipCode: selectedLocation.zipCode,
            coordinates: {
                latitude: selectedLocation.coordinates.latitude,
                longitude: selectedLocation.coordinates.longitude,
            },
            isDefault,
        };

        console.log('Saving address with payload:', JSON.stringify(payload, null, 2));

        try {
            setSaving(true);
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {address ? 'Edit Address' : 'Add New Address'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.black} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {/* Label Picker */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Label</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={label}
                                    onValueChange={(value) => setLabel(value as any)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="🏠 Home" value="Home" />
                                    <Picker.Item label="💼 Work" value="Work" />
                                    <Picker.Item label="📍 Other" value="Other" />
                                </Picker>
                            </View>
                        </View>

                        {/* Location Search */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Address</Text>
                            <LocationSearch
                                value={selectedLocation?.address || ''}
                                onLocationSelect={(location) => setSelectedLocation(location)}
                                placeholder="Search for address..."
                                showSavedAddresses={false}
                            />
                        </View>

                        {/* Selected Location Display */}
                        {selectedLocation && (
                            <View style={styles.selectedLocationCard}>
                                <Ionicons name="location" size={20} color={colors.primary} />
                                <View style={styles.selectedLocationInfo}>
                                    <Text style={styles.selectedLocationText}>
                                        {selectedLocation.address || `${selectedLocation.city}, ${selectedLocation.state}`}
                                    </Text>
                                    <Text style={styles.selectedLocationSubText}>
                                        {selectedLocation.city}, {selectedLocation.state}{' '}
                                        {selectedLocation.zipCode}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Manual Address Fields */}
                        {selectedLocation && (
                            <>
                                <View style={styles.section}>
                                    <Text style={styles.label}>
                                        Building / House Number {!selectedLocation.address && <Text style={styles.required}>*</Text>}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={manualAddress.building}
                                        onChangeText={(text) => setManualAddress(prev => ({ ...prev, building: text }))}
                                        placeholder="e.g., 123, Building A"
                                        placeholderTextColor={colors.grey}
                                    />
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.label}>
                                        Street / Area {!selectedLocation.address && <Text style={styles.required}>*</Text>}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={manualAddress.street}
                                        onChangeText={(text) => setManualAddress(prev => ({ ...prev, street: text }))}
                                        placeholder="e.g., Main Road, MG Street"
                                        placeholderTextColor={colors.grey}
                                    />
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.label}>Landmark (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={manualAddress.landmark}
                                        onChangeText={(text) => setManualAddress(prev => ({ ...prev, landmark: text }))}
                                        placeholder="e.g., Near City Mall"
                                        placeholderTextColor={colors.grey}
                                    />
                                </View>
                            </>
                        )}

                        {/* Set as Default */}
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setIsDefault(!isDefault)}
                        >
                            <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                                {isDefault && (
                                    <Ionicons name="checkmark" size={16} color={colors.white} />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>Set as default address</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Save Button */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (!selectedLocation || saving) && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!selectedLocation || saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving ? 'Saving...' : 'Save Address'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AddEditAddress;

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/header';
import { SavedAddress } from '../../../types';
import { LocationData } from '../../../services/locationService';
import LocationSearch from '../../../components/LocationSearch';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import {
    addSavedAddress,
    updateSavedAddress,
} from '../../../services/savedAddressApi';
import { createStyles } from './styles';

const AddEditAddressScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    // Get address from route params if editing
    const address = (route.params as any)?.address as SavedAddress | undefined;
    const isEditing = !!address;

    const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [isDefault, setIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [manualAddress, setManualAddress] = useState({
        building: '',
        street: '',
        landmark: ''
    });

    // Initialize form when editing
    useEffect(() => {
        if (address) {
            setLabel(address.label);
            setIsDefault(address.isDefault);
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

    const handleSave = async () => {
        if (!selectedLocation) {
            Toast.show({
                type: 'error',
                text1: 'Location Required',
                text2: 'Please select a location first',
            });
            return;
        }

        // Combine manual address fields if Google Places didn't provide full address
        const manualAddressStr = `${manualAddress.building} ${manualAddress.street}`.trim();
        const fullAddress = selectedLocation.address || manualAddressStr || selectedLocation.city;

        // Validation: ensure we have at least some address information
        if (!fullAddress || fullAddress === selectedLocation.city) {
            if (!manualAddress.building && !manualAddress.street) {
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
            if (isEditing && address) {
                await updateSavedAddress(address._id!, payload);
                Toast.show({
                    type: 'success',
                    text1: 'Updated',
                    text2: 'Address updated successfully',
                });
            } else {
                await addSavedAddress(payload);
                Toast.show({
                    type: 'success',
                    text1: 'Saved',
                    text2: 'Address saved successfully',
                });
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error saving address:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save address',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header
                showBackButton={true}
                title={isEditing ? 'Edit Address' : 'Add New Address'}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
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
                        <Text style={styles.label}>Search Location</Text>
                        <LocationSearch
                            value={selectedLocation?.address || ''}
                            onLocationSelect={(location) => setSelectedLocation(location)}
                            placeholder="Search for city or area..."
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

                    {/* Bottom spacing for keyboard */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Save Button - Fixed at bottom */}
                <View style={styles.footer}>
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddEditAddressScreen;

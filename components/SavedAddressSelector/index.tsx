import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SavedAddress } from '../../types';
import { getSavedAddresses } from '../../services/savedAddressApi';
import Toast from 'react-native-toast-message';
import { createStyles } from './styles';

interface SavedAddressSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (address: SavedAddress) => void;
    onAddNew: () => void;
}

const SavedAddressSelector: React.FC<SavedAddressSelectorProps> = ({
    visible,
    onClose,
    onSelect,
    onAddNew,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchAddresses();
        }
    }, [visible]);

    const fetchAddresses = async () => {
        try {
            console.log('SavedAddressSelector: Fetching addresses...');
            setLoading(true);
            const response = await getSavedAddresses();
            console.log('SavedAddressSelector: Response:', response.data);
            if (response.data.success) {
                // Sort to show default first
                const sorted = (response.data.data || []).sort((a: SavedAddress, b: SavedAddress) =>
                    a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
                );
                console.log('SavedAddressSelector: Sorted addresses:', sorted);
                setAddresses(sorted);
            }
        } catch (error) {
            console.error('SavedAddressSelector: Error fetching saved addresses:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load saved addresses',
            });
        } finally {
            setLoading(false);
        }
    };

    const getIconName = (label: string) => {
        switch (label) {
            case 'Home':
                return 'home';
            case 'Work':
                return 'briefcase';
            default:
                return 'location';
        }
    };

    const handleSelect = (address: SavedAddress) => {
        onSelect(address);
        onClose();
    };

    const renderAddress = ({ item }: { item: SavedAddress }) => (
        <TouchableOpacity
            style={styles.addressItem}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={getIconName(item.label) as any}
                    size={20}
                    color={colors.primary}
                />
            </View>
            <View style={styles.addressInfo}>
                <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{item.label}</Text>
                    {item.isDefault && (
                        <Ionicons name="star" size={14} color="#FFD700" />
                    )}
                </View>
                <Text style={styles.addressText} numberOfLines={1}>
                    {item.address}
                </Text>
                <Text style={styles.addressSubText} numberOfLines={1}>
                    {item.city}, {item.state}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Saved Addresses</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.black} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={addresses}
                            renderItem={renderAddress}
                            keyExtractor={(item) => item._id || ''}
                            contentContainerStyle={styles.listContainer}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons
                                        name="location-outline"
                                        size={60}
                                        color={colors.border}
                                    />
                                    <Text style={styles.emptyText}>No Saved Addresses</Text>
                                    <Text style={styles.emptySubText}>
                                        Add your first address to get started
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    <TouchableOpacity style={styles.addButton} onPress={() => {
                        onClose();
                        onAddNew();
                    }}>
                        <Ionicons name="add-circle" size={20} color={colors.primary} />
                        <Text style={styles.addButtonText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default SavedAddressSelector;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { SavedAddress } from "../../types";
import {
  getSavedAddresses,
  deleteSavedAddress,
  setDefaultAddress,
} from "../../services/savedAddressApi";
import Toast from "react-native-toast-message";
import { createStyles } from "./styles";

interface SavedAddressesProps {
  onAddressSelect?: (address: SavedAddress) => void;
  onAddNew: () => void;
  onEdit: (address: SavedAddress) => void;
  initialAddresses?: SavedAddress[];
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  onAddressSelect,
  onAddNew,
  onEdit,
  initialAddresses = [],
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [loading, setLoading] = useState(initialAddresses.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getSavedAddresses();
      if (response.data.success) {
        setAddresses(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching saved addresses:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load saved addresses",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = (address: SavedAddress) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${address.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedAddress(address._id!);
              Toast.show({
                type: "success",
                text1: "Deleted",
                text2: "Address deleted successfully",
              });
              fetchAddresses();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete address",
              });
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (address: SavedAddress) => {
    try {
      await setDefaultAddress(address._id!);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${address.label} set as default`,
      });
      fetchAddresses();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to set default address",
      });
    }
  };

  const getIconName = (label: string) => {
    switch (label) {
      case "Home":
        return "home";
      case "Work":
        return "briefcase";
      default:
        return "location";
    }
  };

  const renderAddress = ({ item }: { item: SavedAddress }) => (
    <TouchableOpacity
      style={styles.addressCard}
      onPress={() => onAddressSelect?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
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
                <View style={styles.defaultBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {item.address}
            </Text>
            <Text style={styles.addressSubText} numberOfLines={1}>
              {item.city}, {item.state}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item)}
            >
              <Ionicons name="star-outline" size={20} color={colors.grey} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil" size={20} color={colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item._id || ""}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={() => fetchAddresses(true)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={colors.border} />
            <Text style={styles.emptyText}>No Saved Addresses</Text>
            <Text style={styles.emptySubText}>
              Add your frequently used addresses for quick selection
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SavedAddresses;

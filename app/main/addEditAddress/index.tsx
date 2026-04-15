import React, { useState, useEffect } from "react";
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
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import { SavedAddress } from "../../../types";
import { LocationData } from "../../../services/locationService";
import LocationSearch from "../../../components/LocationSearch";
import Toast from "react-native-toast-message";
import {
  addSavedAddress,
  updateSavedAddress,
} from "../../../services/savedAddressApi";
import { createStyles } from "./styles";
import CustomButton from "../../../components/CustomButton";

type AddressLabel = "Home" | "Work" | "Other";

const LABEL_OPTIONS: { value: AddressLabel; icon: string; emoji: string }[] = [
  { value: "Home", icon: "home-outline", emoji: "🏠" },
  { value: "Work", icon: "briefcase-outline", emoji: "💼" },
  { value: "Other", icon: "location-outline", emoji: "📍" },
];

const AddEditAddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const address = (route.params as any)?.address as SavedAddress | undefined;
  const isEditing = !!address;

  const [label, setLabel] = useState<AddressLabel>("Home");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    building: "",
    street: "",
    landmark: "",
  });

  useEffect(() => {
    if (address) {
      setLabel(address.label as AddressLabel);
      setIsDefault(address.isDefault);
      setSelectedLocation({
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode || "",
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
        type: "error",
        text1: "Location Required",
        text2: "Please select a location first",
      });
      return;
    }

    const manualAddressStr =
      `${manualAddress.building} ${manualAddress.street}`.trim();
    const fullAddress =
      selectedLocation.address || manualAddressStr || selectedLocation.city;

    if (!fullAddress || fullAddress === selectedLocation.city) {
      if (!manualAddress.building && !manualAddress.street) {
        Toast.show({
          type: "error",
          text1: "Address Required",
          text2: "Please enter building number or street name",
        });
        return;
      }
    }

    // Append landmark to address if provided
    const finalAddress = manualAddress.landmark
      ? `${fullAddress}, Near ${manualAddress.landmark}`
      : fullAddress;

    const payload = {
      label,
      address: finalAddress,
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

    try {
      setSaving(true);
      if (isEditing && address) {
        await updateSavedAddress(address._id!, payload);
        Toast.show({
          type: "success",
          text1: "Updated",
          text2: "Address updated successfully",
        });
      } else {
        await addSavedAddress(payload);
        Toast.show({
          type: "success",
          text1: "Saved",
          text2: "Address saved successfully",
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving address:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save address",
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
        title={isEditing ? "Edit Address" : "Add New Address"}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Label Selector — replaces Picker for cross-platform consistency */}
          <View style={styles.section}>
            <Text style={styles.label}>Label</Text>
            <View style={localStyles.labelRow}>
              {LABEL_OPTIONS.map((opt) => {
                const isSelected = label === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      localStyles.labelChip,
                      {
                        borderColor: isSelected ? colors.primary : colors.grey,
                        backgroundColor: isSelected
                          ? colors.primary + "15"
                          : "transparent",
                      },
                    ]}
                    onPress={() => setLabel(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={localStyles.labelEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        localStyles.labelChipText,
                        { color: isSelected ? colors.primary : colors.grey },
                      ]}
                    >
                      {opt.value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location Search */}
          <View style={styles.section}>
            <Text style={styles.label}>Search Location</Text>
            <LocationSearch
              value={selectedLocation?.address || ""}
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
                  {selectedLocation.address ||
                    `${selectedLocation.city}, ${selectedLocation.state}`}
                </Text>
                <Text style={styles.selectedLocationSubText}>
                  {selectedLocation.city}, {selectedLocation.state}{" "}
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
                  Building / House Number{" "}
                  {!selectedLocation.address && (
                    <Text style={styles.required}>*</Text>
                  )}
                </Text>
                <TextInput
                  style={styles.input}
                  value={manualAddress.building}
                  onChangeText={(text) =>
                    setManualAddress((prev) => ({ ...prev, building: text }))
                  }
                  placeholder="e.g., 123, Building A"
                  placeholderTextColor={colors.grey}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  Street / Area{" "}
                  {!selectedLocation.address && (
                    <Text style={styles.required}>*</Text>
                  )}
                </Text>
                <TextInput
                  style={styles.input}
                  value={manualAddress.street}
                  onChangeText={(text) =>
                    setManualAddress((prev) => ({ ...prev, street: text }))
                  }
                  placeholder="e.g., Main Road, MG Street"
                  placeholderTextColor={colors.grey}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={manualAddress.landmark}
                  onChangeText={(text) =>
                    setManualAddress((prev) => ({ ...prev, landmark: text }))
                  }
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
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isDefault && styles.checkboxChecked]}
            >
              {isDefault && (
                <Ionicons name="checkmark" size={16} color={colors.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button — fixed at bottom */}
        <CustomButton
          text={saving ? "Saving..." : "Save Address"}
          onPress={handleSave}
          disabled={!selectedLocation || saving}
          style={{ paddingHorizontal: 16 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Local styles only for the label chip row — everything else uses createStyles(colors)
const localStyles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  labelChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  labelEmoji: {
    fontSize: 16,
  },
  labelChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AddEditAddressScreen;
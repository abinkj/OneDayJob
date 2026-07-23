import React, { useState } from "react";
import { View, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import SavedAddresses from "../../../components/SavedAddresses";
import { SavedAddress } from "../../../types";

const SavedAddressesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const userData = useSelector(
    (state: RootState) => state.authentication.userData
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh addresses when screen comes into focus (after adding/editing)
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const handleAddNew = () => {
    console.log("handleAddNew called, navigating to AddEditAddress");
    (navigation as any).navigate("AddEditAddress");
  };

  const handleEdit = (address: SavedAddress) => {
    console.log("handleEdit called, navigating to AddEditAddress with address");
    (navigation as any).navigate("AddEditAddress", { address });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />
      <Header showBackButton={true} title="Saved Addresses" />

      <SavedAddresses
        key={refreshKey}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        initialAddresses={userData?.savedAddresses}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SavedAddressesScreen;

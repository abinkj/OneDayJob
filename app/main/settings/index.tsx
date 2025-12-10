import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Colors } from "../../../constants/Colors";
import { Header } from "../../../components/header";
import { logoutUser } from "../../../utilities/authentication";
import { getCurrentUser } from "../../../services/api";
import { User } from "../../../types";
import Images from "../../../utilities/images";
import Toast from "react-native-toast-message";
import styles from "./styles";
import strings from "../../../utilities/strings";

interface SettingsItemProps {
  icon: string;
  iconFamily?: "ionicons" | "material";
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  danger?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  iconFamily = "ionicons",
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
  danger = false,
}) => {
  const IconComponent = iconFamily === "material" ? MaterialIcons : Ionicons;

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[styles.iconContainer, danger && styles.iconContainerDanger]}
        >
          <IconComponent
            name={icon as any}
            size={22}
            color={danger ? Colors.red : Colors.blue}
          />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsItemTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent ||
        (showArrow && (
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        ))}
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

const Settings: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh user data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load user data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      navigation.navigate("EditProfile", { user });
    }
  };

  const handleBankAccount = () => {
    navigation.navigate("BankAccount");
  };

  const handlePaymentHistory = () => {
    navigation.navigate("PaymentHistory");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            dispatch(logoutUser() as any);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                const userId = user.id || user._id;
                // Call API to delete user
                // Assuming deleteUser is imported from api.tsx, if not we need to import it
                // We'll trust the import is handled or I'll fix it in a separate step if needed.
                // Wait, I need to make sure deleteUser is imported.
                // Let's use dispatch(logoutUser()) after success.

                // Since I can't easily auto-add imports here without risking conflict,
                // I will add the logic and if import is missing I will fix it.
                // Actually, I should probably check imports first.
                // But let's write the logic:

                setIsLoading(true);
                // We need to import deleteUser at the top.
                // For now, let's use the one we just added.
                // Note: I will add the import in a subsequent tool call if needed or use a multi-replace.
                // Actually, let's just emit the logic and then check imports.

                // Dynamic import to avoid import issues? No, standard import is better.
                // Let's rely on adding it to the imports in a separate replace/multi-replace.
                const { deleteUser } = require("../../../services/api");

                await deleteUser(userId);

                Toast.show({
                  type: "success",
                  text1: "Account Deleted",
                  text2: "Your account has been deleted successfully",
                });

                // clear local data and logout
                dispatch(logoutUser() as any);
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete account. Please try again.",
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Settings" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Settings" showBackButton />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          disabled={true}
          //onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <Image
            source={user?.profilePicture}
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          {/* <Ionicons name="chevron-forward" size={20} color={Colors.grey} /> */}
        </TouchableOpacity>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />
          {/* <SettingsItem
            icon="card-outline"
            title="Bank Account"
            subtitle="Manage your payment details"
            onPress={handleBankAccount}
          />
          <SettingsItem
            icon="receipt-outline"
            title="Payment History"
            subtitle="View your transaction history"
            onPress={handlePaymentHistory}
          /> */}
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive push notifications"
            showArrow={false}
            rightComponent={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{
                  false: Colors.switchGrey,
                  true: Colors.switchBlue,
                }}
                thumbColor={Colors.white}
              />
            }
          />
          <SettingsItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive email updates"
            showArrow={false}
            rightComponent={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{
                  false: Colors.switchGrey,
                  true: Colors.switchBlue,
                }}
                thumbColor={Colors.white}
              />
            }
          />
          <SettingsItem
            icon="briefcase-outline"
            title="Job Alerts"
            subtitle="Get notified about new jobs"
            showArrow={false}
            rightComponent={
              <Switch
                value={jobAlerts}
                onValueChange={setJobAlerts}
                trackColor={{
                  false: Colors.switchGrey,
                  true: Colors.switchBlue,
                }}
                thumbColor={Colors.white}
              />
            }
          />
        </SettingsSection>

        {/* App Settings Section */}
        <SettingsSection title="App Settings">
          <SettingsItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Enable dark theme"
            showArrow={false}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={(value) => {
                  setDarkMode(value);
                  Toast.show({
                    type: "info",
                    text1: "Coming Soon",
                    text2: "Dark mode will be available soon",
                  });
                }}
                trackColor={{
                  false: Colors.switchGrey,
                  true: Colors.switchBlue,
                }}
                thumbColor={Colors.white}
              />
            }
          />
          <SettingsItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Coming Soon",
                text2: "Language selection will be available soon",
              });
            }}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with your account"
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Coming Soon",
                text2: "Help center will be available soon",
              });
            }}
          />
          <SettingsItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() => {
              navigation.navigate("PrivacyPolicy", {
                url: strings.APP_TERMS_CONDITIONS,
                title: "Terms & Conditions",
              });
            }}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => {
              navigation.navigate("PrivacyPolicy", {
                url: strings.APP_PRIVACY_POLICY,
                title: "Privacy Policy",
              });
            }}
          />
          <SettingsItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "OneDayJob",
                text2: "Version 1.0.0",
              });
            }}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Danger Zone">
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            showArrow={false}
            danger
          />
          <SettingsItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            showArrow={false}
            danger
          />
        </SettingsSection>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

export default Settings;

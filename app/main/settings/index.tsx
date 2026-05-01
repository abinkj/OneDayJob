import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import CustomSwitch from "../../../components/CustomSwich";
import { Image } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
// import { Colors } from "../../../constants/Colors";
import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import { ProfileSkeleton } from "../../../components/Shimmer/Skeletons";
import { logoutUser } from "../../../utilities/authentication";
import Images from "../../../utilities/images";
import Toast from "react-native-toast-message";
import styles from "./styles";
import strings from "../../../utilities/strings";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { RootState } from "../../../redux/store";

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
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: colors.addressGrey }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: danger ? "#FFE5E5" : colors.categoryBox },
            danger && styles.iconContainerDanger,
          ]}
        >
          <IconComponent
            name={icon as any}
            size={22}
            color={danger ? colors.red : colors.blue}
          />
        </View>
        <View style={styles.settingsItemText}>
          <Text
            style={[
              styles.settingsItemTitle,
              { color: danger ? colors.red : colors.black },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsItemSubtitle, { color: colors.grey }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent ||
        (showArrow && (
          <Ionicons name="chevron-forward" size={20} color={colors.grey} />
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
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.grey }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
        {children}
      </View>
    </View>
  );
};

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const userData = useSelector(
    (state: RootState) => state.authentication.userData,
  );

  // Removed: user, isProfileLoading states — userData from Redux is the source of truth
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingTheme, setIsTogglingTheme] = useState(false);

  const { theme, colors, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  const { showAlert } = useAlert();

  const handleEditProfile = () => {
    if (userData) {
      navigation.navigate("EditProfile", { user: userData }); // pass userData directly
    }
  };

  const handleLogout = () => {
    showAlert({
      type: "warning",
      title: "Logout",
      message: "Are you sure you want to log out?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            dispatch(logoutUser() as any);
          },
        },
      ],
    });
  };

  const handleDeleteAccount = () => {
    showAlert({
      type: "warning",
      title: "Delete Account",
      message:
        "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = userData?.id || userData?._id; // use userData directly
              if (!userId) return;

              setIsLoading(true);
              const { deleteUser } = require("../../../services/api");
              await deleteUser(userId);

              Toast.show({
                type: "success",
                text1: "Account Deleted",
                text2: "Your account has been deleted successfully",
              });

              dispatch(logoutUser() as any);
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
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Settings" showBackButton />
        <ProfileSkeleton />
      </View>
    );
  }

  // Resolve profile image source from userData (Redux only)
  const profileImageSource =
    userData?.profilePictureUrl &&
    typeof userData.profilePictureUrl === "string" &&
    userData.profilePictureUrl.startsWith("http")
      ? { uri: userData.profilePictureUrl }
      : userData?.profilePicture &&
          typeof userData.profilePicture === "string" &&
          userData.profilePicture.startsWith("http")
        ? { uri: userData.profilePicture }
        : Images.profile.profileImage;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t("settings.title")} showBackButton />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.white }]}
          disabled={true}
          //onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <Image
            //key={`settings-${userData?.profilePictureUrl || userData?.profilePicture}`}
            source={profileImageSource}
            style={[
              styles.profileImage,
              { backgroundColor: colors.categoryBox },
            ]}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
            cachePolicy="memory-disk"
            //transition={300}
            onError={(error) => {
              console.error("Settings image load error:", error);
              console.error(
                "Failed to load image URL:",
                userData?.profilePictureUrl || userData?.profilePicture,
              );
            }}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.black }]}>
              {userData?.firstName} {userData?.lastName}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.grey }]}>
              {userData?.phoneNumber}
            </Text>
          </View>
          {/* <Ionicons name="chevron-forward" size={20} color={colors.grey} /> */}
        </TouchableOpacity>

        {/* Account Section */}
        <SettingsSection title={t("settings.account")}>
          <SettingsItem
            icon="person-outline"
            title={t("settings.editProfile")}
            subtitle={t("settings.editProfileSub")}
            onPress={handleEditProfile}
          />
          <SettingsItem
            icon="location-outline"
            title={t("settings.savedAddresses")}
            subtitle={t("settings.savedAddressesSub")}
            onPress={() => navigation.navigate("SavedAddresses")}
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
        {/* <SettingsSection title="Notifications">
          <SettingsItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive push notifications"
            showArrow={false}
            rightComponent={
              <CustomSwitch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            }
          />
          <SettingsItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive email updates"
            showArrow={false}
            rightComponent={
              <CustomSwitch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
            }
          />
          <SettingsItem
            icon="briefcase-outline"
            title="Job Alerts"
            subtitle="Get notified about new jobs"
            showArrow={false}
            rightComponent={
              <CustomSwitch value={jobAlerts} onValueChange={setJobAlerts} />
            }
          />
        </SettingsSection> */}

        {/* App Settings Section */}
        <SettingsSection title={t("settings.appSettings")}>
          <SettingsItem
            icon="moon-outline"
            title={t("settings.darkMode")}
            subtitle={t("settings.darkModeSub")}
            showArrow={false}
            rightComponent={
              isTogglingTheme ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <CustomSwitch
                  value={darkMode}
                  onValueChange={async (value) => {
                    setIsTogglingTheme(true);
                    // Use requestAnimationFrame to defer the theme change
                    // This prevents UI freeze by allowing the loading state to render first
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        toggleTheme();
                        // Reset loading state after theme has changed
                        setTimeout(() => {
                          setIsTogglingTheme(false);
                        }, 100);
                      }, 50);
                    });
                  }}
                />
              )
            }
          />
          <SettingsItem
            icon="language-outline"
            title={t("settings.language")}
            subtitle={
              i18n.language === "en"
                ? t("languages.en")
                : i18n.language === "es"
                  ? t("languages.es")
                  : t("languages.ml")
            }
            onPress={() => navigation.navigate("Language")}
          />
          <SettingsItem
            icon="flash-outline"
            title="Socket IO Test"
            subtitle="Diagnostics & Data Stream test"
            onPress={() => navigation.navigate("TestSocket")}
          />
        </SettingsSection>
        <SettingsSection title={"Job Postings"}>
          <SettingsItem
            icon="log-out-outline"
            title={"Job Posting History"}
            onPress={() => navigation.navigate("JobPostingHistory")}
            showArrow={false}
          />
        </SettingsSection>
        {/* Support Section */}
        <SettingsSection title={t("settings.support")}>
          <SettingsItem
            icon="help-circle-outline"
            title={t("settings.helpSupport")}
            subtitle={t("settings.helpSupportSub")}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: t("settings.comingSoon"),
                text2: "Help center will be available soon",
              });
            }}
          />
          <SettingsItem
            icon="document-text-outline"
            title={t("settings.termsConditions")}
            onPress={() => {
              navigation.navigate("PrivacyPolicy", {
                url: strings.APP_TERMS_CONDITIONS,
                title: t("settings.termsConditions"),
              });
            }}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title={t("settings.privacyPolicy")}
            onPress={() => {
              navigation.navigate("PrivacyPolicy", {
                url: strings.APP_PRIVACY_POLICY,
                title: t("settings.privacyPolicy"),
              });
            }}
          />
          <SettingsItem
            icon="information-circle-outline"
            title={t("settings.about")}
            subtitle={t("settings.version")}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "OneDayJob",
                text2: t("settings.version"),
              });
            }}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title={t("settings.logout")}>
          <SettingsItem
            icon="log-out-outline"
            title={t("settings.logout")}
            onPress={handleLogout}
            showArrow={false}
            danger
          />
          <SettingsItem
            icon="trash-outline"
            title={t("settings.deleteAccount")}
            subtitle={t("settings.deleteAccountSub")}
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

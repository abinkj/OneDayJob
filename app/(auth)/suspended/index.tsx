import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../utilities/authentication";
import { useTheme } from "../../../contexts/ThemeContext";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Header } from "../../../components/header";
import { fontSizes } from "../../../themes/fonts";
import { strings } from "../../../utilities/strings";

const SuspendedScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.authentication.userData);

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@zoopol.com?subject=Account Suspension Appeal - " + (userData?.phoneNumber || ""));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={strings.auth.suspended.headerTitle} />
      
      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.duration(800).springify()}
          style={styles.iconContainer}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.red + "15" }]}>
            <Ionicons name="shield-outline" size={80} color={colors.red} />
            <View style={[styles.alertBadge, { backgroundColor: colors.red }]}>
              <Ionicons name="close" size={20} color="white" />
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: colors.black }]}>{strings.auth.suspended.title}</Text>
          <Text style={[styles.subtitle, { color: colors.grey }]}>
            {strings.auth.suspended.subtitle}
          </Text>
          
          <View style={[styles.infoBox, { backgroundColor: colors.categoryBox }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.black }]}>
              {strings.auth.suspended.infoBox}
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(400).duration(800)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={handleContactSupport}
          >
            <Text style={styles.contactButtonText}>{strings.auth.suspended.contactSupport}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: colors.primary }]}>{strings.auth.suspended.signOut}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.grey }]}>
          {strings.auth.suspended.footerTeam}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  alertBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: fontSizes.size28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: fontSizes.size16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.size14,
    marginLeft: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 40,
  },
  contactButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactButtonText: {
    color: "white",
    fontSize: fontSizes.size18,
    fontWeight: "bold",
  },
  logoutButton: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: fontSizes.size16,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: fontSizes.size12,
  },
});

export default SuspendedScreen;

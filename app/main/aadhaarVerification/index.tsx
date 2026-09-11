import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import {
  initiateDigiLocker,
  fetchDigiLockerResult,
} from "../../../services/api/aadhaarApi";
import { completeAadhaarVerification } from "../../../redux/reducers/authReducers";
import Toast from "react-native-toast-message";

// The HTTPS redirect URL Cashfree navigates to after DigiLocker consent.
// Must be https:// — Cashfree rejects custom URI schemes.
// Our backend's /digilocker/callback does a 302 → zoopol://digilocker-callback
// so openAuthSessionAsync can detect the custom scheme and auto-close the browser.
const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'https://api.zoopol.com/api').replace(/\/$/, '');
const DIGILOCKER_REDIRECT_URL = `${API_BASE}/verification/aadhaar/digilocker/callback`;

// The custom scheme openAuthSessionAsync monitors for (must match what the backend 302s to)
const DIGILOCKER_CALLBACK_SCHEME = 'zoopol://digilocker-callback';

// ─── Screen Component ─────────────────────────────────────────────────────────

const AadhaarVerificationContent = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { isAadhaarVerified, aadhaarDetails, userData } = useSelector(
    (state: any) => state.authentication
  );

  const effectiveIsAadhaarVerified = Boolean(
    userData?.aadhaarVerification?.isVerified ?? isAadhaarVerified
  );
  const effectiveAadhaarDetails =
    userData?.aadhaarVerification || aadhaarDetails;

  const onVerificationSuccess = route.params?.onSuccess;

  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState<any>(
    effectiveIsAadhaarVerified ? effectiveAadhaarDetails : null
  );
  const [isVerified, setIsVerified] = useState(effectiveIsAadhaarVerified);

  // ── Fetch result from backend after browser closes ──────────────────────────

  const handleFetchResult = useCallback(async (vid: string, retryCount = 0) => {
    try {
      const result = await fetchDigiLockerResult(vid);

      if (result.success && result.data?.isVerified && result.data?.aadhaarDetails) {
        const details = result.data.aadhaarDetails;
        setVerifiedDetails(details);
        setIsVerified(true);
        dispatch(completeAadhaarVerification(details));
        Toast.show({
          type: "success",
          text1: "Verified Successfully",
          text2: "Your identity has been verified via DigiLocker!",
        });
        setLoading(false);
      } else if (
        (result.data?.status === "PENDING" || result.data?.status === "INITIATED") &&
        retryCount < 3
      ) {
        setTimeout(() => handleFetchResult(vid, retryCount + 1), 2000);
      } else {
        Toast.show({
          type: "info",
          text1: result.data?.status || "Pending",
          text2:
            result.message || "Verification is still pending. Tap verify again to check.",
        });
        setLoading(false);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch result";
      Toast.show({ type: "error", text1: "Error", text2: errorMsg });
      setLoading(false);
    }
  }, [dispatch]);

  // ── Main handler ────────────────────────────────────────────────────────────

  const handleInitiateVerification = useCallback(async () => {
    setLoading(true);
    try {
      // Pass the backend HTTPS URL as redirect_url (Cashfree requires https://)
      // The backend /digilocker/callback does a 302 to zoopol://digilocker-callback
      const response = await initiateDigiLocker(DIGILOCKER_REDIRECT_URL);

      if (!response.success || !response.data) {
        throw new Error("Failed to initiate verification");
      }

      const { verificationId: vid, digilockerUrl, isSimulated: sim } = response.data;
      setIsSimulated(Boolean(sim));

      if (sim) {
        // Simulated sandbox — no browser needed, auto-complete
        await handleFetchResult(vid);
        return;
      }

      // Open DigiLocker in native browser (SFSafariViewController on iOS,
      // Chrome Custom Tabs on Android). openAuthSessionAsync monitors for a
      // redirect to DIGILOCKER_CALLBACK_URL and closes the browser automatically.
      const result = await WebBrowser.openAuthSessionAsync(
        digilockerUrl,
        DIGILOCKER_CALLBACK_SCHEME
      );

      if (result.type === "success") {
        // Browser was closed by a redirect to our callback URL — verification complete
        await handleFetchResult(vid);
      } else if (result.type === "cancel") {
        // User dismissed the browser manually
        Toast.show({
          type: "info",
          text1: "Cancelled",
          text2: "DigiLocker verification was cancelled",
        });
        setLoading(false);
      } else {
        Toast.show({
          type: "info",
          text1: "Closed",
          text2: "Browser was closed. Tap verify to check your status.",
        });
        setLoading(false);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to start verification";

      if (msg.includes("already verified")) {
        setIsVerified(true);
        Toast.show({
          type: "success",
          text1: "Already Verified",
          text2: "Your Aadhaar is already verified!",
        });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: msg });
      }
      setLoading(false);
    }
  }, [handleFetchResult]);

  const handleFinish = () => {
    navigation.goBack();
    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Drag Indicator */}
      <View style={styles.modalHeaderHandleContainer}>
        <View style={styles.modalHandle} />
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#059669" />
          <Text style={styles.securityText}>
            Powered by Cashfree DigiLocker • Government Verified • Your Aadhaar
            number never touches our servers
          </Text>
        </View>

        {!isVerified ? (
          /* ── Initiate Verification Card ── */
          <View style={styles.card}>
            <View style={styles.illustrationContainer}>
              <View style={styles.digilockerIcon}>
                <Ionicons name="finger-print-outline" size={48} color="#4F46E5" />
              </View>
            </View>

            <Text style={styles.stepTitle}>Verify Your Identity</Text>
            <Text style={styles.stepSubtitle}>
              To apply for jobs on OneDayJob, we need to verify your identity
              using DigiLocker — India's official digital document wallet.
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>
                  Your Aadhaar number stays with DigiLocker
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>
                  Government-approved consent-based verification
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>
                  Completes in 30 seconds — just 2-3 taps
                </Text>
              </View>
            </View>

            {isSimulated && (
              <View style={styles.sandboxNotice}>
                <Ionicons name="information-circle-outline" size={18} color="#D97706" />
                <Text style={styles.sandboxNoticeText}>
                  Development Test Mode — verification will auto-complete.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleInitiateVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryButtonText}>
                    Verify with DigiLocker
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Success Card ── */
          <View style={[styles.card, styles.successCard]}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Identity Verified!</Text>
            <Text style={styles.successSubtitle}>
              Your identity has been authenticated via DigiLocker. You can now
              apply for jobs across OneDayJob.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Aadhaar</Text>
                <Text style={styles.detailValue}>
                  {verifiedDetails?.maskedAadhaar || "Verified"}
                </Text>
              </View>

              {verifiedDetails?.name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Verified Name</Text>
                  <Text style={styles.detailValue}>{verifiedDetails.name}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>VERIFIED</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Continue to Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const AadhaarVerificationScreen = () => <AadhaarVerificationContent />;
export default AadhaarVerificationScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeaderHandleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  scrollContent: {
    padding: 20,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065F46",
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  digilockerIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  benefitsList: {
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary || "#4F46E5",
    width: "100%",
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sandboxNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
  },
  sandboxNoticeText: {
    fontSize: 13,
    color: "#92400E",
    marginLeft: 6,
    flex: 1,
  },
  successCard: {
    alignItems: "center",
    paddingVertical: 32,
    width: "100%",
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
});

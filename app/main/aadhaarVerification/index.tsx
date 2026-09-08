import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
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

// DigiLocker SDK — conditionally imported so the app doesn't crash if native modules aren't linked
let DigiLockerProvider: any = null;
let useDigiLocker: any = null;
try {
  const sdk = require("@cashfreepayments/react-native-digilocker");
  DigiLockerProvider = sdk.DigiLockerProvider;
  useDigiLocker = sdk.useDigiLocker;
} catch {
  // SDK not available — will fall back to simulated flow
}

// ─── Inner Component (consumes DigiLocker hook if available) ─────────────────

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

  // State
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState<any>(
    effectiveIsAadhaarVerified ? effectiveAadhaarDetails : null
  );
  const [isVerified, setIsVerified] = useState(effectiveIsAadhaarVerified);

  // Attempt to use SDK hook
  const digiLocker = useDigiLocker ? useDigiLocker() : null;

  const handleInitiateVerification = useCallback(async () => {
    setLoading(true);
    try {
      const response = await initiateDigiLocker();

      if (!response.success || !response.data) {
        throw new Error("Failed to initiate verification");
      }

      const { verificationId: vid, digilockerUrl, isSimulated: sim } = response.data;
      setVerificationId(vid);
      setIsSimulated(Boolean(sim));

      // If DigiLocker SDK is available, use it
      if (digiLocker && !sim) {
        digiLocker.verify(
          digilockerUrl,
          response.data.redirectUrl || "https://verification.cashfree.com/dgl/status",
          {
            userFlow: "signin",
            onSuccess: async () => {
              await handleFetchResult(vid);
            },
            onError: (error: string) => {
              Toast.show({
                type: "error",
                text1: "Verification Failed",
                text2: error || "DigiLocker verification encountered an error",
              });
              setLoading(false);
            },
            onCancel: () => {
              Toast.show({
                type: "info",
                text1: "Cancelled",
                text2: "DigiLocker verification was cancelled",
              });
              setLoading(false);
            },
          }
        );
      } else {
        // Simulated sandbox flow — auto-complete
        await handleFetchResult(vid);
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
  }, [digiLocker]);

  const handleFetchResult = async (vid: string) => {
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
      } else {
        Toast.show({
          type: "info",
          text1: result.data?.status || "Pending",
          text2: result.message || "Verification is still pending",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.error?.message || "Failed to fetch result",
      });
    } finally {
      setLoading(false);
    }
  };

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

// ─── Exported Screen (wraps with DigiLockerProvider if SDK available) ────────

export const AadhaarVerificationScreen = () => {
  if (DigiLockerProvider) {
    return (
      <DigiLockerProvider>
        <AadhaarVerificationContent />
      </DigiLockerProvider>
    );
  }
  return <AadhaarVerificationContent />;
};

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

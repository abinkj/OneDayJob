import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RazorpayCheckout from "react-native-razorpay";
import { Colors } from "../../constants/Colors";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
} from "../../services/api";
import Toast from "react-native-toast-message";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  jobId: string;
  jobName: string;
  onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  jobId,
  jobName,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch payment status when modal opens
  useEffect(() => {
    if (visible && jobId) {
      fetchPaymentStatus();
    }
  }, [visible, jobId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await getPaymentStatus(jobId);
      setPaymentStatus(response.data.data);
    } catch (error) {
      console.error("Error fetching payment status:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch payment status",
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create payment order
      console.log("Creating payment order for job:", jobId);
      const orderResponse = await createPaymentOrder(jobId);

      if (!orderResponse.data.success) {
        throw new Error(
          orderResponse.data.message || "Failed to create payment order"
        );
      }

      const { orderId, amount, currency, paymentId, jobDetails } =
        orderResponse.data.data;

      console.log("Payment order created:", {
        orderId,
        amount,
        currency,
        jobDetails,
      });

      // Step 2: Open Razorpay checkout
      const razorpayKeyId =
        process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RMzqDiXiJLzbEv";

      const options = {
        description: `Payment for ${jobName}`,
        image: "https://i.imgur.com/3g7nmJC.png", // Replace with your logo
        currency: currency,
        key: razorpayKeyId,
        amount: amount, // Amount in paise
        name: "OneDayJob",
        order_id: orderId,
        prefill: {
          email: "",
          contact: "",
          name: "",
        },
        theme: { color: Colors.primary },
      };

      console.log("Opening Razorpay with options:", options);

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // Payment successful
          console.log("Payment successful:", data);

          try {
            // Step 3: Verify payment
            const verifyResponse = await verifyPayment(
              data.razorpay_order_id,
              data.razorpay_payment_id,
              data.razorpay_signature
            );

            if (verifyResponse.data.success) {
              Toast.show({
                type: "success",
                text1: "Payment Successful",
                text2: `₹${(amount / 100).toLocaleString()} paid successfully`,
              });

              // Refresh payment status
              await fetchPaymentStatus();

              // Call success callback
              if (onPaymentSuccess) {
                onPaymentSuccess();
              }

              // Close modal after a short delay
              setTimeout(() => {
                onClose();
              }, 2000);
            }
          } catch (verifyError: any) {
            console.error("Payment verification failed:", verifyError);
            Toast.show({
              type: "error",
              text1: "Verification Failed",
              text2:
                verifyError.response?.data?.message ||
                "Payment verification failed",
            });
          }
        })
        .catch((error: any) => {
          // Payment failed or cancelled
          console.log("Payment failed or cancelled:", error);

          if (error.code !== 2) {
            // Code 2 means user cancelled
            Toast.show({
              type: "error",
              text1: "Payment Failed",
              text2: error.description || "Payment could not be completed",
            });
          }
        });
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message ||
          error.message ||
          "Failed to initiate payment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loadingStatus ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading payment details...</Text>
              </View>
            ) : paymentStatus?.hasPaid ? (
              // Already paid
              <View style={styles.paidContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color="#4CAF50"
                />
                <Text style={styles.paidTitle}>Payment Completed</Text>
                <Text style={styles.paidText}>
                  This job has already been paid
                </Text>

                {paymentStatus.payment && (
                  <View style={styles.paymentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount Paid:</Text>
                      <Text style={styles.detailValue}>
                        ₹{paymentStatus.payment.amount?.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Platform Fee:</Text>
                      <Text style={styles.detailValue}>
                        ₹{paymentStatus.payment.platformFee?.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Worker Amount:</Text>
                      <Text style={styles.detailValue}>
                        ₹{paymentStatus.payment.workerAmount?.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Paid On:</Text>
                      <Text style={styles.detailValue}>
                        {paymentStatus.payment.paidAt
                          ? new Date(
                              paymentStatus.payment.paidAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : paymentStatus?.canPay ? (
              // Can pay
              <View style={styles.payContainer}>
                <Ionicons name="wallet-outline" size={64} color={Colors.primary} />
                <Text style={styles.payTitle}>Complete Payment</Text>
                <Text style={styles.paySubtitle}>{jobName}</Text>

                {paymentStatus.payment && (
                  <View style={styles.paymentInfo}>
                    <Text style={styles.infoText}>
                      Job completed successfully! Please make the payment to
                      complete the transaction.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.payButton,
                    loading && styles.payButtonDisabled,
                  ]}
                  onPress={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="card-outline" size={20} color={Colors.white} />
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.secureText}>
                  🔒 Secured by Razorpay
                </Text>
              </View>
            ) : (
              // Cannot pay (job not completed)
              <View style={styles.notReadyContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={64}
                  color={Colors.grey}
                />
                <Text style={styles.notReadyTitle}>Payment Not Ready</Text>
                <Text style={styles.notReadyText}>
                  {paymentStatus?.reason || "Job is not completed yet"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.grey,
  },
  paidContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  paidTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 16,
  },
  paidText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 8,
    textAlign: "center",
  },
  paymentDetails: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.grey,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  payContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  payTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 16,
  },
  paySubtitle: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 4,
    textAlign: "center",
  },
  paymentInfo: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    color: "#1976D2",
    textAlign: "center",
  },
  payButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  secureText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 12,
  },
  notReadyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  notReadyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 16,
  },
  notReadyText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 8,
    textAlign: "center",
  },
});

export default PaymentModal;



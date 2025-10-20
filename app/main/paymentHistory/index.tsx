import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { Header } from "../../../components/header";
import {
  getWorkerPayouts,
  getCurrentUser,
} from "../../../services/api";
import Toast from "react-native-toast-message";

interface Payout {
  _id: string;
  jobId: {
    _id: string;
    name: string;
  };
  amount: number;
  status: string;
  payoutMethod: string;
  processedAt?: string;
  createdAt: string;
  utr?: string;
}

const PaymentHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user?.id || user?._id) {
        const userId = user.id || user._id;
        const response = await getWorkerPayouts(userId);

        if (response.data.success) {
          setPayouts(response.data.data || []);
        }
      }
    } catch (error: any) {
      console.error("Error loading payment history:", error);
      if (error.response?.status !== 404) {
        // 404 just means no payouts yet
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load payment history",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPaymentHistory();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processed":
        return "#4CAF50";
      case "processing":
        return "#FF9800";
      case "pending":
        return "#FFC107";
      case "failed":
        return "#F44336";
      default:
        return Colors.grey;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "processed":
        return "checkmark-circle";
      case "processing":
        return "time";
      case "pending":
        return "hourglass";
      case "failed":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateTotalEarnings = () => {
    return payouts
      .filter((p) => p.status.toLowerCase() === "processed")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const calculatePendingAmount = () => {
    return payouts
      .filter((p) => ["pending", "processing"].includes(p.status.toLowerCase()))
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Payment History" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Payment History" showBackButton />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="wallet" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.summaryLabel}>Total Earned</Text>
            <Text style={styles.summaryAmount}>
              ₹{calculateTotalEarnings().toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="time" size={24} color="#FF9800" />
            </View>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryAmount}>
              ₹{calculatePendingAmount().toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Add Bank Account CTA */}
        {!currentUser?.bankAccount && !currentUser?.upiDetails && (
          <TouchableOpacity
            style={styles.bankAccountCta}
            onPress={() => navigation.navigate("BankAccount")}
          >
            <Ionicons name="card-outline" size={24} color={Colors.primary} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Add Payment Details</Text>
              <Text style={styles.ctaSubtitle}>
                Add your bank account or UPI to receive payments
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        )}

        {/* Payment History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {payouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={Colors.grey} />
              <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyStateText}>
                Your payment history will appear here once you complete jobs
              </Text>
            </View>
          ) : (
            payouts.map((payout) => (
              <View key={payout._id} style={styles.payoutCard}>
                <View style={styles.payoutHeader}>
                  <View style={styles.payoutIconContainer}>
                    <Ionicons
                      name={getStatusIcon(payout.status)}
                      size={24}
                      color={getStatusColor(payout.status)}
                    />
                  </View>
                  <View style={styles.payoutInfo}>
                    <Text style={styles.payoutJobName}>
                      {typeof payout.jobId === "object"
                        ? payout.jobId.name
                        : "Job Payment"}
                    </Text>
                    <Text style={styles.payoutDate}>
                      {formatDate(payout.processedAt || payout.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.payoutAmountContainer}>
                    <Text style={styles.payoutAmount}>
                      ₹{payout.amount.toLocaleString()}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(payout.status) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(payout.status) },
                        ]}
                      >
                        {payout.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Additional Details */}
                <View style={styles.payoutDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method:</Text>
                    <Text style={styles.detailValue}>
                      {payout.payoutMethod === "bank_account"
                        ? "Bank Transfer"
                        : "UPI"}
                    </Text>
                  </View>
                  {payout.utr && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>UTR:</Text>
                      <Text style={styles.detailValue}>{payout.utr}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info Card */}
        {payouts.length > 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Payments are usually processed within 2-4 business hours after job
              completion
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.grey,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
  },
  bankAccountCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: Colors.grey,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 280,
  },
  payoutCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  payoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  payoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutJobName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: 12,
    color: Colors.grey,
  },
  payoutAmountContainer: {
    alignItems: "flex-end",
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  payoutDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.black,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#F57C00",
    lineHeight: 18,
  },
});

export default PaymentHistoryScreen;



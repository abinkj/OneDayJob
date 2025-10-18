import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { Header } from "../../../components/header";
import {
  addBankAccount,
  addUpiDetails,
  getCurrentUser,
} from "../../../services/api";
import Toast from "react-native-toast-message";

const BankAccountScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");
  
  // Bank account fields
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "current">("savings");
  
  // UPI field
  const [upiId, setUpiId] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      // Pre-fill if user has existing bank details
      if (user?.bankAccount) {
        setPaymentMethod("bank");
        setAccountHolderName(user.bankAccount.accountHolderName || "");
        setAccountNumber(user.bankAccount.accountNumber || "");
        setConfirmAccountNumber(user.bankAccount.accountNumber || "");
        setIfscCode(user.bankAccount.ifscCode || "");
        setBankName(user.bankAccount.bankName || "");
        setAccountType(user.bankAccount.accountType || "savings");
      } else if (user?.upiDetails) {
        setPaymentMethod("upi");
        setUpiId(user.upiDetails.upiId || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const validateBankDetails = () => {
    if (!accountHolderName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter account holder name",
      });
      return false;
    }

    if (!accountNumber.trim() || accountNumber.length < 9) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid account number",
      });
      return false;
    }

    if (accountNumber !== confirmAccountNumber) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Account numbers do not match",
      });
      return false;
    }

    if (!ifscCode.trim() || ifscCode.length !== 11) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid 11-character IFSC code",
      });
      return false;
    }

    if (!bankName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter bank name",
      });
      return false;
    }

    return true;
  };

  const validateUpiDetails = () => {
    if (!upiId.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter UPI ID",
      });
      return false;
    }

    // Basic UPI ID validation (format: user@bank)
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!upiRegex.test(upiId)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid UPI ID (e.g., user@paytm)",
      });
      return false;
    }

    return true;
  };

  const handleSaveBankAccount = async () => {
    if (!validateBankDetails()) return;

    try {
      setLoading(true);

      const bankDetails = {
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName,
        accountType,
      };

      const response = await addBankAccount(bankDetails);

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Bank account details saved successfully",
        });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error("Error saving bank account:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message ||
          "Failed to save bank account details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpiDetails = async () => {
    if (!validateUpiDetails()) return;

    try {
      setLoading(true);

      const response = await addUpiDetails(upiId.toLowerCase());

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "UPI details saved successfully",
        });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error("Error saving UPI details:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message || "Failed to save UPI details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (paymentMethod === "bank") {
      handleSaveBankAccount();
    } else {
      handleSaveUpiDetails();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Payment Details" showBackButton />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Add your bank account or UPI details to receive payments for completed jobs
          </Text>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                paymentMethod === "bank" && styles.methodButtonActive,
              ]}
              onPress={() => setPaymentMethod("bank")}
            >
              <Ionicons
                name="card-outline"
                size={24}
                color={paymentMethod === "bank" ? Colors.primary : Colors.grey}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  paymentMethod === "bank" && styles.methodButtonTextActive,
                ]}
              >
                Bank Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                paymentMethod === "upi" && styles.methodButtonActive,
              ]}
              onPress={() => setPaymentMethod("upi")}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={paymentMethod === "upi" ? Colors.primary : Colors.grey}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  paymentMethod === "upi" && styles.methodButtonTextActive,
                ]}
              >
                UPI
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bank Account Form */}
        {paymentMethod === "bank" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Account Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name as per bank"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter account number"
                value={confirmAccountNumber}
                onChangeText={setConfirmAccountNumber}
                keyboardType="number-pad"
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter IFSC code (e.g., SBIN0001234)"
                value={ifscCode}
                onChangeText={(text) => setIfscCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.accountTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    accountType === "savings" && styles.accountTypeButtonActive,
                  ]}
                  onPress={() => setAccountType("savings")}
                >
                  <Text
                    style={[
                      styles.accountTypeText,
                      accountType === "savings" && styles.accountTypeTextActive,
                    ]}
                  >
                    Savings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    accountType === "current" && styles.accountTypeButtonActive,
                  ]}
                  onPress={() => setAccountType("current")}
                >
                  <Text
                    style={[
                      styles.accountTypeText,
                      accountType === "current" && styles.accountTypeTextActive,
                    ]}
                  >
                    Current
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* UPI Form */}
        {paymentMethod === "upi" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPI Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter UPI ID (e.g., user@paytm)"
                value={upiId}
                onChangeText={(text) => setUpiId(text.toLowerCase())}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.helperText}>
                This is your UPI address (e.g., 9876543210@paytm, user@oksbi)
              </Text>
            </View>
          </View>
        )}

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment details are encrypted and secure
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save Details</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
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
  methodSelector: {
    flexDirection: "row",
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: Colors.white,
    gap: 8,
  },
  methodButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey,
  },
  methodButtonTextActive: {
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  helperText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 4,
  },
  accountTypeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  accountTypeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey,
  },
  accountTypeTextActive: {
    color: Colors.primary,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 12,
    color: Colors.grey,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BankAccountScreen;



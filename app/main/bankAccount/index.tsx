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
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { Header } from "../../../components/header";
import {
  addBankAccount,
  addUpiDetails,
  getCurrentUser,
} from "../../../services/api";
import Toast from "react-native-toast-message";
import { skipKyc, completeKyc } from "../../../redux/reducers/authReducers";
import { saveKycStatus, saveUserData } from "../../../utilities/asyncStore";

const BankAccount = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { kycStatus } = useSelector((state) => state.authentication);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(3); // 1: Pancard, 2: Aadhar, 3: Bank details

  // Pancard fields - Temporarily commented out
  // const [panNumber, setPanNumber] = useState("");

  // Aadhar fields - Temporarily commented out
  // const [aadharNumber, setAadharNumber] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");

  // Bank account fields
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "current">(
    "savings"
  );

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

      // Pre-fill pancard and aadhar if available - Temporarily commented out
      // if (user?.panNumber) {
      //   setPanNumber(user.panNumber);
      // }
      // if (user?.aadharNumber) {
      //   setAadharNumber(user.aadharNumber);
      // }

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

  // Temporarily commented out - PAN validation
  // const validatePanNumber = () => {
  //   if (!panNumber.trim()) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Validation Error",
  //       text2: "Please enter PAN number",
  //     });
  //     return false;
  //   }

  //   const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  //   if (!panRegex.test(panNumber.toUpperCase())) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Validation Error",
  //       text2: "Please enter a valid PAN number (e.g., ABCDE1234F)",
  //     });
  //     return false;
  //   }

  //   return true;
  // };

  // Temporarily commented out - Aadhar validation
  // const validateAadharNumber = () => {
  //   if (!aadharNumber.trim()) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Validation Error",
  //       text2: "Please enter Aadhar number",
  //     });
  //     return false;
  //   }

  //   const aadharRegex = /^[0-9]{12}$/;
  //   if (!aadharRegex.test(aadharNumber)) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Validation Error",
  //       text2: "Please enter a valid 12-digit Aadhar number",
  //     });
  //     return false;
  //   }

  //   return true;
  // };

  // Temporarily commented out - handleNext navigation
  // const handleNext = () => {
  //   if (currentStep === 1) {
  //     if (validatePanNumber()) {
  //       setCurrentStep(2);
  //     }
  //   } else if (currentStep === 2) {
  //     if (validateAadharNumber()) {
  //       setCurrentStep(3);
  //     }
  //   }
  // };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
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
        // Update local user data with bank details from API response
        if (response.data.data) {
          // API response contains updated user object
          await saveUserData(response.data.data);
        } else {
          // Fallback: Merge bank details into existing local user data
          const currentUser = await getCurrentUser();
          if (currentUser) {
            const userWithBankDetails = {
              ...currentUser,
              bankAccount: {
                accountHolderName,
                accountNumber,
                ifscCode: ifscCode.toUpperCase(),
                bankName,
                accountType,
              },
            };
            await saveUserData(userWithBankDetails);
          }
        }

        await saveKycStatus("completed");
        dispatch(completeKyc());
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
        await saveKycStatus("completed");
        dispatch(completeKyc());
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
        text2: error.response?.data?.message || "Failed to save UPI details",
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

  const handleSkip = async () => {
    Alert.alert(
      "Skip KYC Setup",
      "You can skip this for now, but you'll need to complete KYC to post jobs and apply for jobs. You can complete it later from your profile.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          style: "default",
          onPress: async () => {
            try {
              await saveKycStatus("skipped");
              dispatch(skipKyc());
              navigation.replace("MainStack");
            } catch (error) {
              console.error("Error skipping KYC:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to skip KYC",
              });
            }
          },
        },
      ]
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      // case 1:
      //   return "PAN Card Details";
      // case 2:
      //   return "Aadhar Card Details";
      case 3:
        return "Bank Details";
      default:
        return "Bank Details";
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={getStepTitle()}
        showBackButton={kycStatus !== "not_started"}
        showSkipButton={kycStatus !== "not_started"}
        onSkipPress={handleSkip}
      />

      {/* Step Indicator - Temporarily commented out for PAN and Aadhar */}
      {/* <View style={styles.stepIndicator}>
        <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= 1 && styles.stepCircleActive,
            ]}
          >
            {currentStep > 1 ? (
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= 1 && styles.stepNumberActive,
                ]}
              >
                1
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep >= 1 && styles.stepLabelActive,
            ]}
          >
            PAN
          </Text>
        </View>
        <View
          style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]}
        />
        <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= 2 && styles.stepCircleActive,
            ]}
          >
            {currentStep > 2 ? (
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= 2 && styles.stepNumberActive,
                ]}
              >
                2
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep >= 2 && styles.stepLabelActive,
            ]}
          >
            Aadhar
          </Text>
        </View>
        <View
          style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]}
        />
        <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= 3 && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= 3 && styles.stepNumberActive,
              ]}
            >
              3
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep >= 3 && styles.stepLabelActive,
            ]}
          >
            Bank
          </Text>
        </View>
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: PAN Card Details - Temporarily commented out */}
        {/* {currentStep === 1 && (
          <>
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.infoText}>
                Enter your PAN card number. This is required for KYC
                verification and tax purposes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PAN Card Number</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PAN Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter PAN number (e.g., ABCDE1234F)"
                  value={panNumber}
                  onChangeText={(text) => setPanNumber(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <Text style={styles.helperText}>
                  Format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)
                </Text>
              </View>
            </View>
          </>
        )} */}

        {/* Step 2: Aadhar Card Details - Temporarily commented out */}
        {/* {currentStep === 2 && (
          <>
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.infoText}>
                Enter your Aadhar card number. This is required for identity
                verification.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aadhar Card Number</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Aadhar Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 12-digit Aadhar number"
                  value={aadharNumber}
                  onChangeText={(text) => {
                    const numbers = text.replace(/[^0-9]/g, "");
                    setAadharNumber(numbers);
                  }}
                  keyboardType="number-pad"
                  maxLength={12}
                />
                <Text style={styles.helperText}>
                  Enter your 12-digit Aadhar number (numbers only)
                </Text>
              </View>
            </View>
          </>
        )} */}

        {/* Step 3: Bank Details */}
        {(currentStep === 3 || true) && (
          <>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.infoText}>
                Add your bank account or UPI details to receive payments for
                completed jobs
              </Text>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.methodSelector}>
                <TouchableOpacity
                  disabled={true}
                  style={[
                    styles.methodButton,
                    paymentMethod === "bank" && styles.methodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod("bank")}
                >
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={
                      paymentMethod === "bank" ? Colors.primary : Colors.grey
                    }
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

                {/* <TouchableOpacity
                  style={[
                    styles.methodButton,
                    paymentMethod === "upi" && styles.methodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod("upi")}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={24}
                    color={
                      paymentMethod === "upi" ? Colors.primary : Colors.grey
                    }
                  />
                  <Text
                    style={[
                      styles.methodButtonText,
                      paymentMethod === "upi" && styles.methodButtonTextActive,
                    ]}
                  >
                    UPI
                  </Text>
                </TouchableOpacity> */}
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
                        accountType === "savings" &&
                          styles.accountTypeButtonActive,
                      ]}
                      onPress={() => setAccountType("savings")}
                    >
                      <Text
                        style={[
                          styles.accountTypeText,
                          accountType === "savings" &&
                            styles.accountTypeTextActive,
                        ]}
                      >
                        Savings
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.accountTypeButton,
                        accountType === "current" &&
                          styles.accountTypeButtonActive,
                      ]}
                      onPress={() => setAccountType("current")}
                    >
                      <Text
                        style={[
                          styles.accountTypeText,
                          accountType === "current" &&
                            styles.accountTypeTextActive,
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
                    This is your UPI address (e.g., 9876543210@paytm,
                    user@oksbi)
                  </Text>
                </View>
              </View>
            )}

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.securityText}>
                Your payment details are encrypted and secure
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {/* Temporarily commented out - Next button for PAN/Aadhar steps */}
        {/* {currentStep === 1 || currentStep === 2 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : ( */}
        {true && (
          <View style={styles.buttonRow}>
            {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={Colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.saveButtonText}>Save Details</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  step: {
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.grey,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: "500",
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
    marginBottom: 26,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    gap: 8,
    flex: 1,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 2,
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

export default BankAccount;

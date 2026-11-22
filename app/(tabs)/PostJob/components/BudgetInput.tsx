import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemeColors } from "../../../../constants/Colors";

interface BudgetInputProps {
  budget: string | null;
  setBudget: (value: string) => void;
  styles: any;
  colors: ThemeColors;
  isPermanent?: boolean;
}

const ONE_DAY_PRESETS = [300, 500, 800, 1000, 1500, 2000];
const PERMANENT_PRESETS = [5000, 8000, 10000, 12000, 15000, 20000];

const BudgetInput: React.FC<BudgetInputProps> = ({
  budget,
  setBudget,
  styles,
  colors,
  isPermanent = false,
}) => {
  const minAmount = isPermanent ? 5000 : 300;
  const presets = isPermanent ? PERMANENT_PRESETS : ONE_DAY_PRESETS;

  const numericBudget = budget ? parseFloat(budget) : null;
  const isBelowMin =
    numericBudget !== null && !isNaN(numericBudget) && numericBudget < minAmount;

  const formatPresetText = (amt: number) => {
    if (amt >= 1000) {
      return `₹${amt.toLocaleString("en-IN")}`;
    }
    return `₹${amt}`;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        {isPermanent ? "Enter Monthly Salary Budget" : "Enter Your Budget"}
      </Text>

      {/* Info card */}
      <View style={styles.switchCard}>
        <View style={styles.switchHeader}>
          <View style={styles.switchTitleContainer}>
            <View style={styles.switchTitleRow}>
              <Text style={styles.switchLabel}>
                {isPermanent
                  ? "Monthly Salary Per Person"
                  : "Budget Per Person"}
              </Text>
              <View
                style={[
                  styles.optionalBadge,
                  isPermanent && { backgroundColor: "rgba(99, 102, 241, 0.12)" },
                ]}
              >
                <Text
                  style={[
                    styles.optionalBadgeText,
                    isPermanent && { color: "#6366F1", fontWeight: "700" },
                  ]}
                >
                  Min ₹{minAmount.toLocaleString("en-IN")}{isPermanent ? " / mo" : ""}
                </Text>
              </View>
            </View>
            <Text style={styles.switchSubtitle}>
              {isPermanent
                ? "Monthly salary offered per worker. Monthly wages are paid directly to your staff after the trial."
                : "The budget amount is per person. For multiple vacancies, total payment is calculated accordingly."}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.premiumBudgetContainer}>
        {/* Budget Input */}
        <View
          style={[
            styles.budgetWrapper,
            isBelowMin && { borderBottomColor: colors.red },
          ]}
        >
          <Text
            style={[
              styles.currencyPrefix,
              isBelowMin && { color: colors.red },
            ]}
          >
            ₹
          </Text>
          <TextInput
            style={[
              styles.budgetInput,
              isBelowMin && { color: colors.red },
            ]}
            value={budget ?? ""}
            onChangeText={setBudget}
            placeholder={String(minAmount)}
            placeholderTextColor={colors.grey}
            keyboardType="number-pad"
            inputMode="decimal"
            maxLength={8}
            autoFocus={true}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {isPermanent && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.grey || "#64748B",
                marginLeft: 4,
                marginBottom: 6,
                alignSelf: "flex-end",
              }}
            >
              / month
            </Text>
          )}
        </View>

        {/* Real-time validation warning */}
        {isBelowMin && (
          <Text style={styles.budgetErrorText}>
            {isPermanent
              ? `Monthly salary must be at least ₹${minAmount.toLocaleString("en-IN")}`
              : `Amount must be at least ₹${minAmount}`}
          </Text>
        )}

        {/* Quick Amount Suggestion Cards */}
        <View style={styles.quickAmountSection}>
          <Text style={styles.quickAmountTitle}>Quick Select Amount</Text>
          <View style={styles.quickAmountGrid}>
            {presets.map((amt) => {
              const isSelected = budget === String(amt);
              return (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountCard,
                    isSelected && styles.quickAmountCardActive,
                    isPermanent && isSelected && { borderColor: "#6366F1", backgroundColor: "rgba(99, 102, 241, 0.08)" },
                  ]}
                  onPress={() => setBudget(String(amt))}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      isSelected && styles.quickAmountTextActive,
                      isPermanent && isSelected && { color: "#6366F1", fontWeight: "700" },
                    ]}
                  >
                    {formatPresetText(amt)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(BudgetInput);

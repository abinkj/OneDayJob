import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../../../constants/Colors";

interface BudgetInputProps {
  budget: string | null;
  setBudget: (value: string) => void;
  styles: any;
  colors: ThemeColors;
}

const PRESET_AMOUNTS = [300, 500, 800, 1000, 1500, 2000];

const BudgetInput: React.FC<BudgetInputProps> = ({
  budget,
  setBudget,
  styles,
  colors,
}) => {
  const numericBudget = budget ? parseFloat(budget) : null;
  const isBelowMin =
    numericBudget !== null && !isNaN(numericBudget) && numericBudget < 300;

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Enter Your Budget</Text>
      <Text style={styles.sectionSubtitle}>
        The budget amount is per person. For multiple vacancies, total payment is calculated accordingly.
      </Text>

      <View style={styles.premiumBudgetContainer}>
        {/* Minimum Budget Notice Badge */}
        <View style={styles.budgetMinBadge}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.budgetMinBadgeText}>Minimum budget is ₹300</Text>
        </View>

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
            placeholder="300"
            placeholderTextColor={colors.grey}
            keyboardType="number-pad"
            inputMode="decimal"
            maxLength={7}
            autoFocus={true}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* Real-time validation warning */}
        {isBelowMin && (
          <Text style={styles.budgetErrorText}>
            Amount must be at least ₹300
          </Text>
        )}

        <Text style={styles.budgetHelperText}>
          Budget mentioned is per person
        </Text>

        {/* Quick Amount Suggestion Cards */}
        <View style={styles.quickAmountSection}>
          <Text style={styles.quickAmountTitle}>Quick Select Amount</Text>
          <View style={styles.quickAmountGrid}>
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = budget === String(amt);
              return (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountCard,
                    isSelected && styles.quickAmountCardActive,
                  ]}
                  onPress={() => setBudget(String(amt))}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      isSelected && styles.quickAmountTextActive,
                    ]}
                  >
                    ₹{amt}
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

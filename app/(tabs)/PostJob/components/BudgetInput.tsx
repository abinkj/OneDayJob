import React from "react";
import { View, Text, TextInput } from "react-native";
import { ThemeColors } from "../../../../constants/Colors";

interface BudgetInputProps {
  budget: string | null;
  setBudget: (value: string) => void;
  styles: any;
  colors: ThemeColors;
}

const BudgetInput: React.FC<BudgetInputProps> = ({
  budget,
  setBudget,
  styles,
  colors,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Enter Your Budget</Text>

      <View style={styles.premiumBudgetContainer}>
        <View style={styles.budgetWrapper}>
          <Text style={styles.currencyPrefix}>₹</Text>
          <TextInput
            style={styles.budgetInput}
            value={budget}
            onChangeText={setBudget}
            placeholder="0"
            placeholderTextColor={colors.grey}
            keyboardType="number-pad"
            inputMode='decimal'
            maxLength={7}
            autoFocus={true}
            //returnKeyType="next"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.budgetHelperText}>
          Budget mentioned is per person
        </Text>
      </View>
    </View>
  );
};

export default BudgetInput;

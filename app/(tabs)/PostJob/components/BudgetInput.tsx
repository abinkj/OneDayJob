import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { ThemeColors } from '../../../../constants/Colors';

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

            <View style={styles.budgetContainer}>
                <Text style={styles.currencyText}>₹</Text>
                <TextInput
                    style={styles.currencySymbol}
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="200"
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </View>
        </View>
    );
};

export default BudgetInput;

import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";
import DeviceDimensions from "../../constants/DeviceDimenions";

interface LabeledInputProps extends TextInputProps {
  title: string;
  helperText?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  title,
  helperText,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {helperText && <Text style={styles.inputHelper}>{helperText}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.subGrey}
          {...textInputProps}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "bold",
      color: colors.black,
    },
    inputHelper: {
      fontSize: 12,
      fontFamily: "regular",
      color: colors.subGrey,
    },
    inputContainer: {
      borderRadius: 8,
      borderColor: colors.border,
      borderWidth: 1,
      backgroundColor: colors.white,
    },
    input: {
      paddingHorizontal: 12 * DeviceDimensions.widthRatio,
      paddingVertical: 12 * DeviceDimensions.heightRatio,
      fontSize: 16,
      fontFamily: "regular",
      color: colors.black,
      width: "100%",
      height: 48 * DeviceDimensions.heightRatio,
    },
  });

export default LabeledInput;

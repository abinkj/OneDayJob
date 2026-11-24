import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";
import DeviceDimensions from "../../constants/DeviceDimenions";
import { fontSizes, fontFamilies } from "../../themes/fonts";

interface LabeledInputProps extends TextInputProps {
  title: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  prefix?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  title,
  helperText,
  leftIcon,
  prefix,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderedIcon = useMemo(() => {
    if (React.isValidElement(leftIcon)) {
      return React.cloneElement(leftIcon as React.ReactElement<any>, {
        color: isFocused ? colors.primary : colors.grey,
      });
    }
    return leftIcon;
  }, [leftIcon, isFocused, colors]);

  return (
    <View style={{ marginBottom: 16, width: "100%" }}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {helperText && <Text style={styles.inputHelper}>{helperText}</Text>}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {renderedIcon && <View style={styles.iconWrapper}>{renderedIcon}</View>}
        {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.grey}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
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
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.bold,
      color: colors.black,
    },
    inputHelper: {
      fontSize: fontSizes.size12,
      fontFamily: fontFamilies.regular,
      color: colors.subGrey,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      borderColor: colors.border,
      borderWidth: 1,
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      height: 56,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    inputContainerFocused: {
      borderColor: colors.primary,
    },
    iconWrapper: {
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    prefixText: {
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.medium,
      color: colors.black,
      marginRight: 12,
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: colors.addressGrey,
    },
    input: {
      flex: 1,
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.regular,
      color: colors.black,
      height: "100%",
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
  });

export default React.memo(LabeledInput);

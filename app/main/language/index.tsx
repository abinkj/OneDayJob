import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import { createStyles } from "./styles";

const Language: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const languages = [
    { code: "en", name: t("languages.en") },
    { code: "ml", name: t("languages.ml") },
  ];

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header title={t("settings.languageSelection")} showBackButton />
      <ScrollView style={styles.content}>
        <View style={styles.languageList}>
          {languages.map((item, index) => {
            const isSelected = i18n.language === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.languageItem,
                  {
                    borderBottomColor: colors.addressGrey,
                    borderBottomWidth: index === languages.length - 1 ? 0 : 1,
                  },
                ]}
                onPress={() => handleLanguageSelect(item.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageText, { color: colors.black }]}>
                    {item.name}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.blue}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Language;

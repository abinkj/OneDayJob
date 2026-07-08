import React from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import Toast from "react-native-toast-message";
import { createStyles } from "./styles";

const TestScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const users = Array.from({ length: 10000 }, (_, index) => ({
    id: index + 1,
  }));

  console.log(users);
  const styles = createStyles(colors);

  const handleTestAlert = () => {
    showAlert({
      type: "info",
      title: "Test Connection",
      message:
        "The custom alert dialog is functioning properly. This is a verification test.",
      buttons: [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          style: "default",
          onPress: () => {
            Toast.show({
              type: "success",
              text1: "Action Confirmed",
              text2: "You clicked confirm on the alert dialog!",
            });
          },
        },
      ],
    });
  };

  const handleTestToast = () => {
    Toast.show({
      type: "info",
      text1: "Instant Toast Notification",
      text2: "System verification: toast service is working!",
    });
  };

  return (
    <View style={styles.container}>
      <Header title={t("settings.testScreen")} showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
      nestedScrollEnabled>
        <View style={styles.card}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.categoryBox },
            ]}
          >
            <Ionicons name="flask-outline" size={36} color={colors.blue} />
          </View>
          <Text style={styles.title}>{t("settings.testScreen")}</Text>
          <Text style={styles.description}>
            This screen verifies navigation paths, translations, theme changes,
            and interface integration successfully.
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.blue, marginBottom: 12 },
            ]}
            onPress={handleTestAlert}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Trigger Alert Dialog
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.categoryBox }]}
            onPress={handleTestToast}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.black }]}>
              Trigger Toast Notification
            </Text>
          </TouchableOpacity>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <Text>{item.id}</Text>}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={20}
             removeClippedSubviews={true}
          />
          {/* <ScrollView>
            {users.map(user=>(<Text key={user.id}>{user.id}</Text>))}
          </ScrollView> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default TestScreen;

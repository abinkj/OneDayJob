import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      width: 52,
      height: 32,
      justifyContent: 'center',
    },
    track: {
      width: 52,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    thumb: {
      width: 16,
      height: 16,
      borderRadius: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
    },
  });
  
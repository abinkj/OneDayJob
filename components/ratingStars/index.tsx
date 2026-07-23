import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";

const ratingStars = (rating: number) => {
  return Array(5)
    .fill(null)
    .map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color={index < rating ? "#FFD700" : "#4A4A4A"}
        style={styles.starIcon}
      />
    ));
};
export default ratingStars;

const styles = StyleSheet.create({
  starIcon: {
    marginRight: 3,
  },
});

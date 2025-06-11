import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const JobCard = ({ data }: { data: any }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image
          source={{ uri: "https://i.pravatar.cc/50" }}
          style={styles.icon}
        />
        <Text style={styles.category}>PAINTING</Text>
        <View style={styles.statusTag}>
          <Text style={styles.statusText}>Open</Text>
        </View>
      </View>

      <Text style={styles.title}>{data.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.price}>{data.rate}</Text>
        <Text style={styles.separator}>|</Text>
        <Text style={styles.slots}>{data.applicants}</Text>
        <Ionicons
          name="person"
          size={14}
          color="#1E1E1E"
          style={{ marginLeft: 8 }}
        />
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location" size={14} color={Colors.iconBlack} />
        <Text style={styles.metaLocation}>{data.location}</Text>
        <Ionicons
          name="calendar"
          size={14}
          color={Colors.iconBlack}
          style={{ marginLeft: 14 }}
        />
        <Text style={styles.metaText}>{data.date}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.avatars}>
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=1" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=2" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=3" }}
            style={styles.avatar}
          />
          <Text style={styles.requestText}>10+ Requests</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 8,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 1234,
    marginRight: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2A2A2A80",
    marginRight: "auto",
  },
  statusTag: {
    backgroundColor: Colors.whiteBack,
    paddingHorizontal: 19,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.black,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.black,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    color: Colors.blue,
    fontWeight: "600",
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 12,
    color: Colors.black,
  },
  slots: {
    fontSize: 14,
    color: Colors.subGrey,
  },
  metaText: {
    fontSize: 14,
    color: Colors.subGrey,
    fontWeight: "400",
    marginLeft: 4,
  },
  metaLocation: {
    fontSize: 14,
    color: Colors.subGrey,
    fontWeight: "400",
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  avatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 30,
    marginRight: -5,
  },
  requestText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.subGrey,
    fontWeight: "500",
  },
  button: {
    borderColor: Colors.black,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "400",
  },
});

export default JobCard;

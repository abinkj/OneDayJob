import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import { Header } from "../../components/header";
import styles from "./styles";

const task = {
  title: "Furniture Lifting Help Needed",
  status: "Open",
  budget: "₹500",
  postedBy: {
    name: "Darell Steward",
    timeAgo: "2 days ago",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  date: "Friday, Mar. 28",
  time: "Midday or Afternoon",
  location: "Kochi, KL",
  description:
    "I need two people to help move furniture from my second-floor apartment to a moving truck. It includes a sofa, bed, and a few boxes. The task should take around an hour.",
  photos: [
    "https://picsum.photos/200/300?1",
    "https://picsum.photos/200/300?2",
    "https://picsum.photos/200/300?3",
    "https://picsum.photos/200/300?4",
    "https://picsum.photos/200/300?5",
  ],
  requirements: ["Pick up van"],
};

const Status = () => {
  return (
    <View style={styles.container}>
      <Header title="Status" />
      
      <Text style={styles.title}>{task.title}</Text>

      <View style={styles.row}>
        <Text style={styles.status}>{task.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>POSTED BY</Text>
        <View style={styles.userRow}>
          <Image source={{ uri: task.postedBy.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{task.postedBy.name}</Text>
            <Text style={styles.timeAgo}>{task.postedBy.timeAgo}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.section}>
          <Text style={styles.label}>DATE</Text>
          <Text style={styles.value}>{task.date}</Text>
          <Text style={styles.subValue}>{task.time}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>LOCATION</Text>
          <Text style={styles.value}>{task.location}</Text>
          <Text style={[styles.subValue, { color: "#0066CC" }]}>View</Text>
        </View>
      </View>

      <Text style={styles.label}>DESCRIPTION</Text>
      <Text style={styles.description}>{task.description}</Text>

      <Text style={styles.label}>PHOTOS</Text>
      <FlatList
        data={task.photos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.photo} />
        )}
        style={styles.photos}
      />

      <Text style={styles.label}>REQUIREMENTS</Text>
      <View style={styles.requirement}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.requirementText}>{task.requirements[0]}</Text>
      </View>
    </View>
  );
};

export default Status;

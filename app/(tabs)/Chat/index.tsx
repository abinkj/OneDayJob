import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import ChatItem from "../../../components/chatItem";
import { Header } from "../../../components/header";
import styles from "./styles";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { getConversations } from "../../../services/api";
import { Colors } from "../../../constants/Colors";
import Toast from "react-native-toast-message";

export default function Chat() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      console.log("Conversations fetched:", response);

      // Transform the response to match ChatItem expected format
      const conversations = response.data?.conversations || [];
      const transformedConversations = conversations.map((conv: any) => {
        // Find the other participant (not the current user)
        const otherParticipant = conv.participants?.find(
          (p: any) => p.id !== conv.createdBy
        );

        return {
          id: conv._id,
          name: otherParticipant
            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
            : "Unknown User",
          message: conv.lastMessage?.content?.text || "No messages yet",
          avatar: otherParticipant?.profilePicture || "",
          unread: conv.unreadCount || 0,
          conversationId: conv._id,
          participant: otherParticipant,
        };
      });

      setConversations(transformedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load conversations",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleChatPress = (item: any) => {
    navigation.navigate("ChatScreen", {
      conversationId: item.conversationId,
      participant: {
        id: item.participant?._id,
        name: item.name,
        avatar: item.avatar,
      },
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.grey }}>
          Loading conversations...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Chats" />
      <View style={styles.chatHeader} />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        bounces={false}
        renderItem={({ item }) => (
          <ChatItem item={item} onPress={() => handleChatPress(item)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Text style={{ color: Colors.grey, fontSize: 16 }}>
              No conversations yet
            </Text>
            <Text style={{ color: Colors.grey, fontSize: 14, marginTop: 5 }}>
              Start a chat from a job or profile
            </Text>
          </View>
        }
      />
    </View>
  );
}

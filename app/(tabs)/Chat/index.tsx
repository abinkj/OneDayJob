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
import { ChatListSkeleton } from "../../../components/Shimmer/Skeletons";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { getConversations } from "../../../services/api";
import { Colors } from "../../../constants/Colors";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";

export default function Chat() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

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
          time: formatTime(conv.lastMessage?.createdAt || conv.updatedAt),
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
    return <ChatListSkeleton />;
  }

  return (
    <View style={styles.container}>
      <Header title="Chats" />
      <View style={styles.chatHeader} />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        bounces={true}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ChatItem item={item} onPress={() => handleChatPress(item)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.categoryBox,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="chatbubbles" size={60} color={colors.primary} />
            </View>
            <Text
              style={{
                color: colors.black,
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              No Chats Yet
            </Text>
            <Text
              style={{
                color: colors.grey,
                fontSize: 16,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Connect with employers or job seekers to start a conversation.
            </Text>
          </View>
        }
      />
    </View>
  );
}

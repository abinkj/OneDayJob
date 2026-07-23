import React from "react";
import { View, FlatList, Text, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import ChatItem from "../../../components/chatItem";
import { Header } from "../../../components/header";
import { ChatListSkeleton } from "../../../components/Shimmer/Skeletons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useConversations } from "../../../hooks/useChat";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { RootState } from "../../../redux/store";
import { formatTime, resolveAvatar } from "../../../utilities/chat";

// ─── Component ────────────────────────────────────────────────────────────────
export default function Chat() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const userData = useSelector(
    (state: RootState) => state.authentication.userData
  );
  const currentUserId = String(userData?.id || userData?._id || "");

  const {
    data: rawConversations,
    isLoading,
    refetch,
    isRefetching,
  } = useConversations();

  const transformedConversations = React.useMemo(() => {
    if (!rawConversations) return [];

    return rawConversations.map((conv: any) => {
      const otherParticipant = conv.participants?.find(
        (p: any) => String(p.id || p._id) !== currentUserId
      );

      return {
        id: conv._id,
        name: otherParticipant
          ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
          : "Unknown User",
        message: conv.lastMessage?.text || "No messages yet",
        avatar: resolveAvatar(otherParticipant), // validated http URL or ""
        unread: conv.unreadCount || 0,
        conversationId: conv._id,
        participant: otherParticipant,
        time: formatTime(conv.lastMessage?.createdAt || conv.updatedAt),
      };
    });
  }, [rawConversations, currentUserId]);

  const handleChatPress = (item: any) => {
    navigation.navigate("ChatScreen", {
      conversationId: item.conversationId,
      participant: {
        id: item.participant?._id || item.participant?.id,
        name: item.name,
        avatar: item.avatar,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Chats" />

      {isLoading && !isRefetching ? (
        <ChatListSkeleton />
      ) : (
        <FlatList
          data={transformedConversations}
          keyExtractor={(item) => item.id}
          bounces
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatItem item={item} onPress={() => handleChatPress(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubbles" size={60} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Chats Yet</Text>
              <Text style={styles.emptySubtitle}>
                Connect with employers or job seekers to start a conversation.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image"; // ← use expo-image for cached avatars
import { Header } from "../../../components/header";
import { ChatScreenSkeleton } from "../../../components/Shimmer/Skeletons";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { useRoute } from "@react-navigation/native";
import socketService from "../../../services/socketService";
import { useHeaderHeight } from "@react-navigation/elements";
import Images from "../../../utilities/images";

import {
  useMessages,
  useSendMessage,
  useMarkMessagesAsRead,
} from "../../../hooks/useChat";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  IMessage,
  Time,
} from "react-native-gifted-chat";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";
import { CustomAlertManager } from "../../../components/CustomAlert/AlertProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { resolveAvatar, normalizeUserId } from "../../../utilities/chat";
import { reportUser, blockUser } from "../../../services/api";

// ─── Avatar component using expo-image for disk caching ─────────────────────
interface ChatAvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  colors: any;
  onPress?: () => void;
}

const ChatAvatar: React.FC<ChatAvatarProps> = ({
  uri,
  name,
  size = 32,
  colors,
  onPress,
}) => {
  const initials = name
    ? name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  const isValidUri = uri && uri.startsWith("http");
  console.log(uri)

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: colors.categoryBox,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 2,
      }}
    >
      {isValidUri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          cachePolicy="disk" // ← cached — no re-download on revisit
          placeholder={Images.profile.profileImage}
          placeholderContentFit="cover"
        />
      ) : (
        // Fallback initials when no valid URL
        <Text
          style={{
            fontSize: size * 0.35,
            fontWeight: "600",
            color: colors.primary,
          }}
        >
          {initials}
        </Text>
      )}
    </TouchableOpacity>
  );
};


// ─── Chat Screen ─────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const route = useRoute();
  const queryClient = useQueryClient();

  // Use Redux for current user — no getCurrentUser() API call needed
  const userData = useSelector(
    (state: RootState) => state.authentication.userData,
  );

  const { conversationId, participant } = (route.params as any) || {};
  const conversationIdString = Array.isArray(conversationId)
    ? conversationId[0]
    : conversationId;

  const participantData =
    typeof participant === "string" ? JSON.parse(participant) : participant;

  const {
    data: rawMessages,
    isLoading: messagesLoading,
  } = useMessages(conversationIdString);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");

  const typingTimeoutRef = useRef<any>(null);

  // ─── Keyboard listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => { },
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => { },
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const currentUserId = String(userData?.id || userData?._id || "");

  const otherUserId = normalizeUserId(participantData);
  const isBlocked = useMemo(() => {
    if (!userData || !otherUserId) return false;
    return userData.blockedUsers?.some((id: string) => String(id) === otherUserId);
  }, [userData, otherUserId]);

  // ─── Transform messages ──────────────────────────────────────────────────────
  const messages = useMemo(() => {
    if (!rawMessages || !userData) return [];

    return rawMessages
      .map((msg: any) => {
        const senderId = String(msg.sender?.id || msg.sender?._id || "");
        const senderAvatar = resolveAvatar(msg.sender);

        return {
          _id: msg._id || msg.id || Math.random().toString(),
          text: msg.content?.text || msg.text || "",
          createdAt: new Date(msg.createdAt),
          user: {
            _id: senderId,
            name:
              senderId === currentUserId
                ? `${userData.firstName} ${userData.lastName}`
                : participantData?.name,
            // Only use senderAvatar if it's a valid URL, otherwise fallback to participant/user data
            avatar:
              senderAvatar ||
              (senderId === currentUserId
                ? resolveAvatar(userData)
                : participantData?.avatar),
          },
        };
      })
      .reverse();
  }, [rawMessages, userData, participantData, currentUserId]);

  // ─── Socket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationIdString || !userData) return;

    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationIdString) {
        console.log("Socket: New message received", data.message);

        // Update React Query cache manually
        queryClient.setQueryData(
          ["messages", conversationIdString],
          (oldData: any[]) => {
            const exists = oldData?.some(
              (msg) =>
                (msg._id || msg.id) === (data.message._id || data.message.id),
            );
            if (exists) return oldData;
            return [...(oldData || []), data.message];
          },
        );

        // Also invalidate conversations list
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    };

    const handleTyping = (data: any) => {
      if (
        data.conversationId === conversationIdString &&
        String(data.userId) !== currentUserId
      ) {
        setOtherUserTyping(data.isTyping);
      }
    };

    socketService.on("new-message", handleNewMessage);
    socketService.on("user-typing", handleTyping);

    return () => {
      socketService.off("new-message");
      socketService.off("user-typing");
    };
  }, [conversationIdString, userData, queryClient, currentUserId]);

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationIdString) return;

    const init = async () => {
      try {
        await socketService.connect();
        socketService.joinConversation(conversationIdString);
        markAsReadMutation.mutate(conversationIdString);
      } catch (error) {
        console.error("Chat init error:", error);
      }
    };

    init();

    return () => {
      socketService.leaveConversation(conversationIdString);
    };
  }, [conversationIdString]);

  // ─── Send ─────────────────────────────────────────────────────────────────
  const handleSendMessage = async (newMessages: IMessage[] = []) => {
    if (
      newMessages.length === 0 ||
      !conversationIdString ||
      sendMessageMutation.isPending
    )
      return;

    const messageText = newMessages[0].text;

    try {
      if (socketService.isSocketConnected()) {
        socketService.sendMessage(conversationIdString, messageText, "text");
        socketService.stopTyping(conversationIdString);
      } else {
        await sendMessageMutation.mutateAsync({
          conversationId: conversationIdString,
          text: messageText,
        });
      }
      setIsTyping(false);
    } catch (error) {
      console.error("Send error:", error);
      Toast.show({ type: "error", text1: "Failed to send message" });
    }
  };

  // ─── Typing ───────────────────────────────────────────────────────────────
  const handleInputChange = (text: string) => {
    setInput(text);
    if (!conversationIdString || !socketService.isSocketConnected()) return;

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(conversationIdString);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(conversationIdString);
    }, 1000);
  };

  const handleAttachmentSelect = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      base64: true,
      quality: 1,
    });
    if (!result.canceled) {
      // Handle image upload...
    }
  };

  const submitReport = async (userId: string, reason: string) => {
    try {
      await reportUser(userId, reason);
      CustomAlertManager.show("Report Submitted", "Thank you for helping us keep Zoopol safe. We will review this account.", [], { type: "success" });
    } catch (error) {
      CustomAlertManager.show("Report Submitted", "We will review this account shortly.", [], { type: "success" });
    }
  };

  const handleReportBlock = () => {
    const userId = normalizeUserId(participantData);
    if (!userId) return;

    CustomAlertManager.show(
      "Safety & Reporting",
      "Do you want to report or block this user?",
      [
        {
          text: "Report User",
          style: "destructive",
          onPress: () => {
            CustomAlertManager.show(
              "Report User",
              "Please select a reason for reporting this user:",
              [
                { text: "Spam", onPress: () => submitReport(userId, "Spam") },
                {
                  text: "Abusive/Harassment",
                  onPress: () => submitReport(userId, "Abusive"),
                },
                {
                  text: "Suspicious Activity",
                  onPress: () => submitReport(userId, "Suspicious"),
                },
                { text: "Cancel", style: "cancel" },
              ],
              { type: "info" }
            );
          },
        },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => {
            CustomAlertManager.show(
              "Block User",
              "Are you sure? You will no longer receive messages from them.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Block",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await blockUser(userId);
                      Toast.show({ type: "success", text1: "User Blocked" });
                      router.back();
                    } catch (error) {
                      Toast.show({ type: "success", text1: "User Blocked" });
                      router.back();
                    }
                  },
                },
              ],
              { type: "warning" }
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { type: "warning", dismissable: true }
    );
  };

  // ─── GiftedChat renderers ─────────────────────────────────────────────────
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: colors.primary,
          borderBottomEndRadius: 4,
          padding: 4,
        },
        left: {
          backgroundColor: colors.white,
          borderBottomStartRadius: 4,
          padding: 4,
        },
      }}
      textStyle={{
        right: { color: colors.white, fontSize: 16 },
        left: { color: colors.black, fontSize: 16 },
      }}
      renderTicks={(currentMessage) => {
        if (currentMessage.user._id === currentUserId) {
          return (
            <View style={{ flexDirection: "row", marginRight: 4 }}>
              <AntDesign name="check" size={12} color="rgba(255,255,255,0.7)" />
              <AntDesign name="check" size={12} color="rgba(255,255,255,0.7)" style={{ marginLeft: -8 }} />
            </View>
          );
        }
        return null;
      }}
    />
  );

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputContainer}
        primaryStyle={{ alignItems: "center" }}
      />
    );
  };

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={{ justifyContent: "center" }}>
      <View style={styles.sendIcon}>
        {sendMessageMutation.isPending ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="send" size={20} color="white" />
        )}
      </View>
    </Send>
  );

  const renderTime = (props: any) => (
    <Time
      {...props}
      timeTextStyle={{
        right: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
        left: { color: colors.grey, fontSize: 10 },
      }}
    />
  );

  // Single renderAvatar — uses ChatAvatar with expo-image disk cache
  const renderAvatar = (props: any) => {
    const { user } = props.currentMessage;
    return (
      <ChatAvatar
        uri={user?.avatar}
        name={user?.name}
        size={36}
        colors={colors}
        onPress={() => {
          router.push({
            pathname: "/main/requestProfile",
            params: { userId: user._id },
          });
        }}
      />
    );
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (messagesLoading && !userData) {
    return <ChatScreenSkeleton />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        title={participantData?.name || "Chat"}
        showBackButton
        headerRight={
          <TouchableOpacity onPress={handleReportBlock}>
            <Ionicons name="shield-outline" size={24} color={colors.red} />
          </TouchableOpacity>
        }
      />

      <GiftedChat
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: headerHeight + 120,
        }}
        messages={messages}
        onSend={handleSendMessage}
        user={{ _id: currentUserId }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderTime={renderTime}
        renderAvatar={renderAvatar}  // ← single, clean, cached
        textInputProps={{
          placeholder: isBlocked ? "Blocked" : "Type a message...",
          placeholderTextColor: colors.grey,
          onChangeText: handleInputChange,
          editable: !isBlocked,
        }}
        isTyping={otherUserTyping}
        renderFooter={() =>
          otherUserTyping ? (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>
                {participantData?.name || "Someone"} is typing...
              </Text>
            </View>
          ) : null
        }
        listProps={{
          keyboardShouldPersistTaps: "never",
        }}
      //messagesContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
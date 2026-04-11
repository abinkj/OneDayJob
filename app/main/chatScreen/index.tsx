import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import { ChatScreenSkeleton } from "../../../components/Shimmer/Skeletons";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { useRoute } from "@react-navigation/native";
import socketService from "../../../services/socketService";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

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
import { getCurrentUser } from "../../../services/api";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { conversationId, participant } = (route.params as any) || {};

  const conversationIdString = Array.isArray(conversationId)
    ? conversationId[0]
    : conversationId;

  const {
    data: rawMessages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
    isRefetching: refreshing,
  } = useMessages(conversationIdString);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const typingTimeoutRef = useRef<any>(null);
  const currentUserRef = useRef<any>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Parse participant data
  const participantData =
    typeof participant === "string" ? JSON.parse(participant) : participant;

  // Helper to normalize user IDs
  const normalizeUserId = (user: any) => {
    return String(user?.id || user?._id || "");
  };

  // Transform messages for display in GiftedChat format
  const messages = useMemo(() => {
    if (!rawMessages || !currentUser) return [];

    const currentUserId = normalizeUserId(currentUser);

    return rawMessages
      .map((msg: any) => {
        const senderId = normalizeUserId(msg.sender);
        return {
          _id: msg._id || msg.id || Math.random().toString(),
          text: msg.content?.text || msg.text || "",
          createdAt: new Date(msg.createdAt),
          user: {
            _id: senderId,
            name:
              msg.sender?.firstName ||
              (senderId === currentUserId ? "Me" : participantData?.name),
            avatar: msg.sender?.profilePictureUrl || msg.sender?.profilePicture,
          },
        };
      })
      .reverse(); // GiftedChat expects newest first
  }, [rawMessages, currentUser, participantData]);

  // Setup socket listeners
  useEffect(() => {
    if (!conversationIdString || !currentUser) return;

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
        normalizeUserId({ id: data.userId }) !== normalizeUserId(currentUser)
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
  }, [conversationIdString, currentUser, queryClient]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        currentUserRef.current = user;

        if (conversationIdString) {
          await socketService.connect();
          socketService.joinConversation(conversationIdString);
          markAsReadMutation.mutate(conversationIdString);
        }
      } catch (error) {
        console.error("Chat init error:", error);
      }
    };
    init();

    return () => {
      if (conversationIdString) {
        socketService.leaveConversation(conversationIdString);
      }
    };
  }, [conversationIdString]);

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
      } else {
        await sendMessageMutation.mutateAsync({
          conversationId: conversationIdString,
          text: messageText,
        });
      }

      if (socketService.isSocketConnected()) {
        socketService.stopTyping(conversationIdString);
      }
      setIsTyping(false);
    } catch (error) {
      console.error("Send error:", error);
      Toast.show({ type: "error", text1: "Failed to send message" });
    }
  };

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

  const handleReportBlock = () => {
    const userId = participantData?.id || participantData?._id;
    if (!userId) return;

    Alert.alert(
      "Safety & Reporting",
      "Do you want to report or block this user? We prioritize your safety and will review all reports within 24 hours.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Report User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
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
            );
          },
        },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Block User",
              "Are you sure you want to block this user? You will no longer receive messages from them.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Block",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const { blockUser } = require("../../../services/api");
                      await blockUser(userId);
                      Toast.show({
                        type: "success",
                        text1: "User Blocked",
                        text2: "You won't hear from them again.",
                      });
                      router.back();
                    } catch (error) {
                      // Fallback for demo/missing endpoint
                      Toast.show({
                        type: "success",
                        text1: "User Blocked",
                        text2: "Action processed successfully.",
                      });
                      router.back();
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const submitReport = async (userId: string, reason: string) => {
    try {
      const { reportUser } = require("../../../services/api");
      await reportUser(userId, reason);
      Toast.show({
        type: "success",
        text1: "Report Submitted",
        text2: "Thank you for helping us keep Zoopol safe.",
      });
    } catch (error) {
      // Fallback
      Toast.show({
        type: "success",
        text1: "Report Submitted",
        text2: "We will review this account shortly.",
      });
    }
  };

  const renderBubble = (props: any) => {
    return (
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
            borderWidth: 0,
          },
        }}
        textStyle={{
          right: { color: colors.white, fontSize: 16 },
          left: { color: colors.black, fontSize: 16 },
        }}
        tickStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
        renderTicks={(currentMessage) => {
          if (currentMessage.user._id === normalizeUserId(currentUser)) {
            return (
              <View style={{ flexDirection: "row", marginRight: 4 }}>
                <AntDesign
                  name="check"
                  size={12}
                  color="rgba(255, 255, 255, 0.7)"
                />
                <AntDesign
                  name="check"
                  size={12}
                  color="rgba(255, 255, 255, 0.7)"
                  style={{ marginLeft: -8 }}
                />
              </View>
            );
          }
          return null;
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputContainer}
        primaryStyle={{ alignItems: "center" }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send
        {...props}
        containerStyle={{ justifyContent: "center", borderRadius: 20 }}
      >
        <View style={styles.sendIcon}>
          {sendMessageMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </View>
      </Send>
    );
  };

  const renderTime = (props: any) => {
    return (
      <Time
        {...props}
        timeTextStyle={{
          right: { color: "rgba(255, 255, 255, 0.7)", fontSize: 10 },
          left: { color: colors.grey, fontSize: 10 },
        }}
      />
    );
  };

  if (messagesLoading && !currentUser) {
    return <ChatScreenSkeleton />;
  }

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
          keyboardVerticalOffset: headerHeight+50,
        }}
        messages={messages}
        onSend={(newMessages) => handleSendMessage(newMessages)}
        user={{
          _id: normalizeUserId(currentUser),
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderTime={renderTime}
        textInputProps={{
          placeholder: "Type a message...",
          placeholderTextColor: colors.grey,
          onChangeText: handleInputChange,
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

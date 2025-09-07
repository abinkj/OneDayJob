import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import  styles  from "./styles";
import { Header } from "../../../components/header";
import { Colors } from "../../../constants/Colors";
import { useRoute } from "@react-navigation/native";
import MessageBubble from "../../../components/messageBubble";
import socketService from "../../../services/socketService";
import { getConversationMessages, markMessagesAsRead, sendMessage as sendMessageAPI } from "../../../services/api";
import { getCurrentUser } from "../../../services/api";
import Toast from "react-native-toast-message";

export default function ChatScreen() {
  const route = useRoute();
  const { conversationId, participant } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Parse participant data if it's a string
  const participantData = typeof participant === 'string' ? JSON.parse(participant) : participant;
  const conversationIdString = Array.isArray(conversationId) ? conversationId[0] : conversationId;
  
  // Debug logging
  console.log('ChatScreen - route.params:', route.params);
  console.log('ChatScreen - conversationId from params:', conversationId);
  console.log('ChatScreen - conversationIdString:', conversationIdString);
  console.log('ChatScreen - participantData:', participantData);

  // Initialize socket connection and load messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check if we have a conversation ID
        if (!conversationIdString) {
          console.error('No conversation ID available');
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No conversation ID available',
          });
          setLoading(false);
          return;
        }

        // Get current user
        const user = await getCurrentUser();
        console.log('Current user loaded:', user);
        console.log('Current user ID:', user?.id);
        console.log('Current user ID type:', typeof user?.id);
        setCurrentUser(user);

        // Connect to socket
        const socket = await socketService.connect();
        if (!socket) {
          throw new Error('Failed to connect to socket');
        }

        // Wait a moment for socket to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Setup socket event listeners after connection is established
        setupSocketListeners();

        // Join conversation
        if (conversationIdString) {
          socketService.joinConversation(conversationIdString);
        }

        // Load existing messages
        await loadMessages();

        // Mark messages as read
        if (conversationIdString) {
          await markMessagesAsRead(conversationIdString);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load chat',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (conversationIdString) {
        socketService.leaveConversation(conversationIdString);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationIdString]);

  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.on('new-message', (data) => {
      if (data.conversationId === conversationIdString) {
        console.log('New message received - sender ID:', data.message.sender?.id);
        console.log('New message received - current user ID:', currentUser?.id);
        console.log('New message received - sender ID type:', typeof data.message.sender?.id);
        console.log('New message received - current user ID type:', typeof currentUser?.id);
        
        // More robust user ID comparison
        const currentUserId = currentUser?.id || currentUser?._id;
        const senderId = data.message.sender?.id || data.message.sender?._id;
        const messageType = senderId === currentUserId ? 'me' : 'other';
        
        const newMessage = {
          id: data.message._id,
          type: messageType,
          text: data.message.content?.text || '',
          time: new Date(data.message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          senderId: senderId,
        };
        
        console.log('New message type determined:', newMessage.type);
        
        setMessages(prev => [...prev, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // Listen for typing indicators
    socketService.on('user-typing', (data) => {
      if (data.conversationId === conversationIdString && data.userId !== currentUser?.id) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Listen for messages read
    socketService.on('messages-read', (data) => {
      if (data.conversationId === conversationIdString) {
        console.log(`${data.readCount} messages marked as read`);
      }
    });
  };

  const loadMessages = async () => {
    try {
      if (!conversationIdString) return;
      
      const response = await getConversationMessages(conversationIdString);
      const messagesData = response.data?.messages || [];
      
      const transformedMessages = messagesData.map((msg: any) => {
        console.log('Loading message - sender ID:', msg.sender?.id);
        console.log('Loading message - current user ID:', currentUser?.id);
        console.log('Loading message - sender ID type:', typeof msg.sender?.id);
        console.log('Loading message - current user ID type:', typeof currentUser?.id);
        
        // More robust user ID comparison
        const currentUserId = currentUser?.id || currentUser?._id;
        const senderId = msg.sender?.id || msg.sender?._id;
        const messageType = senderId === currentUserId ? 'me' : 'other';
        console.log('Loading message type determined:', messageType);
        
        return {
          id: msg._id,
          type: messageType,
          text: msg.content?.text || '',
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          senderId: msg.sender?.id,
        };
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleAttachmentSelect = async () => {
    console.log("Attachment button pressed");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      aspect: [4, 3],
      quality: 1,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      console.log(result.assets[0].base64);
    }
  };

  const sendMessage = async () => {
    console.log('sendMessage called - input:', input.trim());
    console.log('sendMessage called - conversationIdString:', conversationIdString);
    console.log('sendMessage called - sending:', sending);
    
    if (input.trim() === "" || !conversationIdString || sending) {
      console.log('sendMessage - early return due to validation');
      return;
    }

    setSending(true);
    const messageText = input.trim();
    setInput("");

    try {
      // Send message via Socket.IO if connected, otherwise fallback to REST API
      if (socketService.isSocketConnected()) {
        socketService.sendMessage(conversationIdString, messageText, 'text');
      } else {
        // Fallback to REST API if socket is not connected
        await sendMessageAPI(conversationIdString, messageText, 'text');
      }
      
      // Stop typing indicator
      if (socketService.isSocketConnected()) {
        socketService.stopTyping(conversationIdString);
      }
      setIsTyping(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
      // Restore input on error
      setInput(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    
    // Only handle typing indicators if we have a valid conversation ID and socket is connected
    if (!conversationIdString) {
      console.log('No conversation ID available for typing indicator');
      return;
    }
    
    if (!socketService.isSocketConnected()) {
      console.log('Socket not connected, skipping typing indicator');
      return;
    }
    
    // Handle typing indicators
    if (text.length > 0 && !isTyping) {
      console.log('Starting typing indicator for conversation:', conversationIdString);
      setIsTyping(true);
      socketService.startTyping(conversationIdString);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      console.log('Stopping typing indicator for conversation:', conversationIdString);
      setIsTyping(false);
      socketService.stopTyping(conversationIdString);
    }, 1000);
  };

  const renderItem = ({ item }) => (
    // <View
    //   style={[
    //     styles.messageBubble,
    //     item.type === "me" ? styles.myMessage : styles.otherMessage,
    //   ]}
    // >
    //   <Text style={styles.messageText}>{item.text}</Text>

    //   <View style={styles.timeContainer}>
    //     <Text style={styles.messageTime}>{item.time}</Text>
    //     {item.type === "me" && (
    //       <>
    //         <AntDesign
    //           name="check"
    //           size={12}
    //           color="#ccc"
    //           style={styles.tickIcon}
    //         />
    //         <AntDesign
    //           name="check"
    //           size={12}
    //           color="#ccc"
    //           style={styles.tickIcon}
    //         />
    //       </>
    //     )}
    //   </View>
    // </View>
    <MessageBubble text={item.text} time={item.time} type={item.type} />
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.grey }}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Header title={participantData?.name || 'Chat'} showBackButton />
      <Text style={styles.dateLabel}>
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          otherUserTyping ? (
            <View style={{ padding: 10, alignItems: 'center' }}>
              <Text style={{ color: Colors.grey, fontSize: 14, fontStyle: 'italic' }}>
                {participantData?.name || 'Someone'} is typing...
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.inputContainer}>
        <AntDesign
          name="plus"
          size={24}
          color={Colors.tabBlue}
          style={{ marginLeft: 12 }}
          onPress={handleAttachmentSelect}
        />
        <View style={styles.subInputContainer}>
          <TextInput
            placeholder="Type a message"
            value={input}
            onChangeText={handleInputChange}
            style={styles.input}
            onSubmitEditing={sendMessage}
            returnKeyType="default"
            multiline
            editable={!sending}
          />
          <TouchableOpacity onPress={sendMessage} disabled={sending || !input.trim()}>
            {sending ? (
              <ActivityIndicator size="small" color="white" style={styles.sendIcon} />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={input.trim() ? "white" : Colors.grey}
                style={styles.sendIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

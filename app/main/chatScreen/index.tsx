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
import styles from "./styles";
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
  const { conversationId, participant } = (route.params as any) || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserRef = useRef(null); // Add ref to store current user for socket callbacks

  // Parse participant data if it's a string
  const participantData = typeof participant === 'string' ? JSON.parse(participant) : participant;
  const conversationIdString = Array.isArray(conversationId) ? conversationId[0] : conversationId;
  
  // Helper function to normalize user IDs for consistent comparison
  const normalizeUserId = (user: any) => {
    return String(user?.id || user?._id || '');
  };

  // Helper function to determine message type
  const getMessageType = (senderId: string, currentUserId: string) => {
    const normalizedSender = normalizeUserId({ id: senderId });
    const normalizedCurrent = normalizeUserId({ id: currentUserId });
    return normalizedSender === normalizedCurrent ? 'me' : 'other';
  };

  // Helper function to add message with deduplication
  const addMessage = (newMessage: any) => {
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log('Message already exists, skipping:', newMessage.id);
        return prev;
      }
      console.log('Adding new message:', newMessage);
      const updatedMessages = [...prev, newMessage];
      
      // Scroll to bottom after state update
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      return updatedMessages;
    });
  };
  
  // Debug logging
  console.log('ChatScreen - route.params:', route.params);
  console.log('ChatScreen - conversationId from params:', conversationId);
  console.log('ChatScreen - conversationIdString:', conversationIdString);
  console.log('ChatScreen - participantData:', participantData);

  // Setup socket event listeners with current user ref
  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.on('new-message', (data: any) => {
      if (data.conversationId === conversationIdString) {
        console.log('New message received - sender ID:', data.message.sender?.id);
        console.log('New message received - current user ID from ref:', currentUserRef.current?.id);
        
        // Use the ref instead of state to avoid stale closure
        const currentUserId = normalizeUserId(currentUserRef.current);
        const senderId = normalizeUserId(data.message.sender);
        const messageType = senderId === currentUserId ? 'me' : 'other';
        
        console.log('New message type determined:', messageType);
        console.log('Current user ID normalized:', currentUserId);
        console.log('Sender ID normalized:', senderId);
        
        const newMessage = {
          id: data.message._id || data.message.id,
          type: messageType,
          text: data.message.content?.text || data.message.text || '',
          time: new Date(data.message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          senderId: senderId,
        };
        
        console.log('New message created:', newMessage);
        addMessage(newMessage);
      }
    });

    // Listen for typing indicators
    socketService.on('user-typing', (data) => {
      if (data.conversationId === conversationIdString && 
          normalizeUserId({id: data.userId}) !== normalizeUserId(currentUserRef.current)) {
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

        // Get current user first
        const user = await getCurrentUser();
        console.log('Current user loaded:', user);
        console.log('Current user ID:', user?.id);
        setCurrentUser(user);
        currentUserRef.current = user; // Store in ref for socket callbacks

        // Connect to socket with retry logic
        let socket = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!socket && retryCount < maxRetries) {
          try {
            socket = await socketService.connect();
            if (socket) {
              // Wait for socket to be fully ready
              await new Promise(resolve => setTimeout(resolve, 1000));
              break;
            }
          } catch (error) {
            console.error(`Socket connection attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        if (!socket) {
          console.warn('Socket connection failed, continuing with REST API fallback');
        }

        // Setup socket event listeners after connection is established
        setupSocketListeners();

        // Join conversation only if socket is connected
        if (conversationIdString && socketService.isSocketConnected()) {
          socketService.joinConversation(conversationIdString);
        }

        // Load existing messages with the user data
        await loadMessages(user);

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

  const loadMessages = async (userData = null) => {
    try {
      if (!conversationIdString) return;
      
      // Use the passed userData or current state
      const userToUse = userData || currentUser;
      if (!userToUse) {
        console.log('No user data available for loading messages');
        return;
      }
      
      const response = await getConversationMessages(conversationIdString);
      const messagesData = response.data?.messages || [];
      
      const transformedMessages = messagesData.map((msg: any) => {
        console.log('Loading message - sender ID:', msg.sender?.id);
        console.log('Loading message - current user ID:', userToUse?.id);
        
        // More robust user ID comparison using helper function
        const currentUserId = normalizeUserId(userToUse);
        const senderId = normalizeUserId(msg.sender);
        const messageType = senderId === currentUserId ? 'me' : 'other';
        console.log('Loading message type determined:', messageType);
        
        return {
          id: msg._id || msg.id,
          type: messageType,
          text: msg.content?.text || msg.text || '',
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          senderId: senderId,
        };
      });
      
      setMessages(transformedMessages);
      
      // Scroll to bottom after messages are loaded and rendered
      setTimeout(() => {
        if (transformedMessages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: false }); // Use animated: false for initial load
        }
      }, 500); // Increased timeout to ensure rendering is complete
      
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

    // Create optimistic message for immediate UI feedback
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      type: 'me',
      text: messageText,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderId: normalizeUserId(currentUser),
      isOptimistic: true, // Flag to identify temporary messages
    };

    // Add optimistic message immediately
    addMessage(optimisticMessage);

    try {
      // Send message via Socket.IO if connected, otherwise fallback to REST API
      if (socketService.isSocketConnected()) {
        socketService.sendMessage(conversationIdString, messageText, 'text');
        
        // Remove optimistic message when real message arrives via socket
        // The socket listener will handle adding the real message
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        }, 1000);
        
      } else {
        // Fallback to REST API if socket is not connected
        const response = await sendMessageAPI(conversationIdString, messageText, 'text');
        
        // Replace optimistic message with real message
        if (response?.data?.message) {
          const realMessage = {
            id: response.data.message._id || response.data.message.id,
            type: 'me',
            text: messageText,
            time: new Date(response.data.message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            senderId: normalizeUserId(currentUser),
          };
          
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
            return [...filtered, realMessage];
          });
        }
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
      
      // Remove optimistic message on error and restore input
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setInput(messageText);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    
    // Only handle typing indicators if we have a valid conversation ID and socket is connected
    if (!conversationIdString || !socketService.isSocketConnected()) {
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
    <MessageBubble text={item.text} time={item.time} type={item.type} />
  );

  // Handle content size change to scroll to bottom
  const handleContentSizeChange = () => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

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
        onContentSizeChange={handleContentSizeChange}
        onLayout={() => {
          // Scroll to bottom when FlatList is first laid out
          if (messages.length > 0) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }
        }}
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
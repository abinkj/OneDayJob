import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken } from '../utilities/secureStore';

// Socket.IO configuration
const SOCKET_URL = 'http://192.168.0.101:8000'; // Same as your API base URL
let socket: Socket | null = null;

// Socket event types
export interface SocketEvents {
  // Connection events
  'connected': (data: { userId: string; message: string }) => void;
  'disconnect': () => void;
  'error': (error: { message: string }) => void;
  
  // Message events
  'new-message': (data: { 
    message: { 
      id: string; 
      text: string; 
      senderId: string; 
      conversationId: string; 
      createdAt: string; 
      type: string;
    }; 
    conversationId: string; 
  }) => void;
  'message-sent': (data: { message: any; conversationId: string }) => void;
  'messages-read': (data: { conversationId: string; readCount: number }) => void;
  
  // Conversation events
  'conversation-joined': (data: { conversationId: string; participants: any[] }) => void;
  'conversation-left': (data: { conversationId: string }) => void;
  
  // Typing events
  'user-typing': (data: { 
    userId: string; 
    conversationId: string; 
    isTyping: boolean; 
  }) => void;
  
  // Presence events
  'user-status-changed': (data: { userId: string; status: string }) => void;
  
  // Verification events
  'verification-code-received': (data: { 
    jobId: string; 
    jobName: string;
    code: string;
    timestamp: string;
  }) => void;
  'verification-status-updated': (data: { 
    jobId: string; 
    status: any;
    timestamp: string;
  }) => void;
}

// Socket service class
class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Initialize socket connection
  async connect(): Promise<Socket | null> {
    try {
      if (this.socket?.connected) {
        console.log('Socket already connected');
        return this.socket;
      }

      const token = await getAccessToken();
      if (!token) {
        console.error('No authentication token found');
        return null;
      }

      console.log('Connecting to Socket.IO server...');
      
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['polling', 'websocket'], // Prefer polling first for better stability
        timeout: 60000, // Match server timeout
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
      
      return this.socket;
    } catch (error) {
      console.error('Error connecting to socket:', error);
      return null;
    }
  }

  // Setup socket event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('connected', (data) => {
      console.log('Socket authentication successful:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      
      // Only attempt reconnect if it's not a manual disconnect
      if (error.message !== 'xhr poll error') {
        this.attemptReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Attempt to reconnect
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 10000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Join a conversation
  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Joining conversation:', conversationId);
    this.socket.emit('join-conversation', { conversationId });
  }

  // Leave a conversation
  leaveConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Leaving conversation:', conversationId);
    this.socket.emit('leave-conversation', { conversationId });
  }

  // Send a message
  sendMessage(conversationId: string, text: string, type: string = 'text') {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Sending message:', { conversationId, text, type });
    this.socket.emit('send-message', {
      conversationId,
      text,
      type,
    });
  }

  // Mark messages as read
  markMessagesRead(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Marking messages as read:', conversationId);
    this.socket.emit('mark-messages-read', { conversationId });
  }

  // Start typing indicator
  startTyping(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    if (!conversationId) {
      console.error('Conversation ID is required for typing indicator');
      return;
    }

    this.socket.emit('typing-start', { conversationId });
  }

  // Stop typing indicator
  stopTyping(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    if (!conversationId) {
      console.error('Conversation ID is required for typing indicator');
      return;
    }

    this.socket.emit('typing-stop', { conversationId });
  }

  // Listen to socket events
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on(event as string, callback as any);
  }

  // Remove event listener
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    if (callback) {
      this.socket.off(event as string, callback as any);
    } else {
      this.socket.off(event as string);
    }
  }

  // Get connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get detailed connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketId: this.socket?.id || null
    };
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

import io, { Socket } from "socket.io-client";
import NetInfo from "@react-native-community/netinfo"; // ← ADD THIS
import { getAccessToken } from "../utilities/secureStore";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.5:8000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true when the device has no usable internet connection. */
const checkOffline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !state.isConnected || state.isInternetReachable === false;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocketEvents {
  connected: (data: { userId: string; message: string }) => void;
  disconnect: () => void;
  error: (error: { message: string }) => void;

  "new-message": (data: {
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
  "message-sent": (data: { message: any; conversationId: string }) => void;
  "messages-read": (data: { conversationId: string; readCount: number }) => void;

  "conversation-joined": (data: {
    conversationId: string;
    participants: any[];
  }) => void;
  "conversation-left": (data: { conversationId: string }) => void;

  "user-typing": (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }) => void;

  "user-status-changed": (data: { userId: string; status: string }) => void;

  "verification-code-received": (data: {
    jobId: string;
    jobName: string;
    code: string;
    timestamp: string;
  }) => void;
  "verification-status-updated": (data: {
    jobId: string;
    status: any;
    timestamp: string;
  }) => void;

  new_application: (data: any) => void;
  application_status_update: (data: any) => void;
  "verification-codes-generated": (data: any) => void;

  job_created: (data: any) => void;
  job_updated: (data: any) => void;
  job_deleted: (data: any) => void;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // ── Connect ────────────────────────────────────────────────────────────────

  async connect(): Promise<Socket | null> {
    try {
      if (this.socket?.connected) {
        console.log("Socket already connected");
        return this.socket;
      }

      // ── Network check before attempting TCP connection
      if (await checkOffline()) {
        console.warn("Socket connect skipped — device is offline");
        return null;
      }

      const token = await getAccessToken();
      if (!token) {
        console.error("No authentication token found");
        return null;
      }

      console.log("🔌 Socket Configuration:", { API_URL, SOCKET_URL, hasToken: !!token });

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["polling", "websocket"],
        timeout: 60000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error("Error connecting to socket:", error);
      return null;
    }
  }

  // ── Internal event listeners ───────────────────────────────────────────────

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("connected", (data) => {
      console.log("Socket authentication successful:", data);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;

      if (reason !== "io client disconnect") {
        this.attemptReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", {
        message: error.message,
        socketUrl: SOCKET_URL,
        reconnectAttempts: this.reconnectAttempts,
      });
      this.isConnected = false;
      this.attemptReconnect();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  // ── Reconnect with exponential back-off ────────────────────────────────────

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      10000
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(async () => {
      // ── Don't bother reconnecting if still offline
      if (await checkOffline()) {
        console.warn("Reconnect skipped — still offline");
        return;
      }
      this.connect();
    }, delay);
  }

  // ── Emit guard — shared by all emit methods ────────────────────────────────

  /**
   * Checks both socket connection AND network before emitting.
   * Returns false and logs a warning if either check fails.
   */
  private async canEmit(action: string): Promise<boolean> {
    if (!this.socket?.connected) {
      console.warn(`[${action}] Socket not connected`);
      return false;
    }

    if (await checkOffline()) {
      console.warn(`[${action}] Emit blocked — device is offline`);
      return false;
    }

    return true;
  }

  // ── Public emit methods ────────────────────────────────────────────────────

  async joinConversation(conversationId: string) {
    if (!(await this.canEmit("joinConversation"))) return;
    console.log("Joining conversation:", conversationId);
    this.socket!.emit("join-conversation", { conversationId });
  }

  async leaveConversation(conversationId: string) {
    if (!(await this.canEmit("leaveConversation"))) return;
    console.log("Leaving conversation:", conversationId);
    this.socket!.emit("leave-conversation", { conversationId });
  }

  async sendMessage(conversationId: string, text: string, type = "text") {
    if (!(await this.canEmit("sendMessage"))) return;
    console.log("Sending message:", { conversationId, text, type });
    this.socket!.emit("send-message", { conversationId, text, type });
  }

  async markMessagesRead(conversationId: string) {
    if (!(await this.canEmit("markMessagesRead"))) return;
    console.log("Marking messages as read:", conversationId);
    this.socket!.emit("mark-messages-read", { conversationId });
  }

  async startTyping(conversationId: string) {
    if (!conversationId) {
      console.error("Conversation ID is required for typing indicator");
      return;
    }
    if (!(await this.canEmit("startTyping"))) return;
    this.socket!.emit("typing-start", { conversationId });
  }

  async stopTyping(conversationId: string) {
    if (!conversationId) {
      console.error("Conversation ID is required for typing indicator");
      return;
    }
    if (!(await this.canEmit("stopTyping"))) return;
    this.socket!.emit("typing-stop", { conversationId });
  }

  // ── Listener helpers ───────────────────────────────────────────────────────

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (!this.socket) return;
    this.socket.on(event as string, callback as any);
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event as string, callback as any);
    } else {
      this.socket.off(event as string);
    }
  }

  // ── Status helpers ─────────────────────────────────────────────────────────

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketId: this.socket?.id || null,
    };
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
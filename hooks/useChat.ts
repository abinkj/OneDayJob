import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getConversation,
} from "../services/api";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await getConversations();
      return response.data?.conversations || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useMessages = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await getConversationMessages(conversationId);
      return response.data?.messages || [];
    },
    enabled: !!conversationId,
    staleTime: 0, // Messages should probably not be stale for long in a chat
  });
};

export const useConversation = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const response = await getConversation(conversationId);
      return response.data?.conversation || null;
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      text,
      type = "text",
    }: {
      conversationId: string;
      text: string;
      type?: string;
    }) => sendMessage(conversationId, text, type),
    onSuccess: (_, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      // Also invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markMessagesAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Could also update unread count in specific conversation cache
    },
  });
};

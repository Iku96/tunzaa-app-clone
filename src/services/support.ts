import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

// Types
export interface CreateTicketBody {
  subject: string;
  initial_message: string;
  category: string;
  priority: string;
  vendor_id?: string;
  order_id?: string;
}

export interface Conversation {
  id: string;
  chatwoot_conversation_id?: string;
  tenant_id: string;
  customer_id: string;
  vendor_id?: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  order_id?: string;
  product_id?: string;
  inbox_id?: string;
  source_id?: string;
  custom_attributes?: any;
  tags?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface GetConversationsParams {
  user_id?: string;
  vendor_id?: string;
  status?: string;
  category?: string;
  skip?: number;
  limit?: number;
}

export interface GetConversationsResponse {
  items: Conversation[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetCustomerConversationsParams {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
}

export interface GetCustomerConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
  };
  message: string;
  errors?: any;
}

// API functions
export const supportApi = {
  // Create Support Ticket (Conversation)
  createTicket: async (data: CreateTicketBody): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(
      "/support/conversations",
      data
    );
    return response.data;
  },

  // Get Conversations
  getConversations: async (
    params?: GetConversationsParams
  ): Promise<GetConversationsResponse | Conversation[]> => {
    const searchParams = new URLSearchParams();

    if (params?.user_id) {
      searchParams.append("user_id", params.user_id);
    }
    if (params?.vendor_id) {
      searchParams.append("vendor_id", params.vendor_id);
    }
    if (params?.status) {
      searchParams.append("status", params.status);
    }
    if (params?.category) {
      searchParams.append("category", params.category);
    }
    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get<
      GetConversationsResponse | Conversation[]
    >(`/support/conversations?${searchParams.toString()}`);
    return response.data;
  },

  // Get Customer Conversations (New endpoint for customer-specific tickets)
  getCustomerConversations: async (
    params?: GetCustomerConversationsParams
  ): Promise<GetCustomerConversationsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.offset !== undefined) {
      searchParams.append("offset", params.offset.toString());
    }
    if (params?.status) {
      searchParams.append("status", params.status);
    }
    if (params?.category) {
      searchParams.append("category", params.category);
    }

    const response = await apiClient.get<GetCustomerConversationsResponse>(
      `/support/customer/conversations?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Single Conversation
  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(
      `/support/conversations/${conversationId}`
    );
    return response.data;
  },

  // Send Message in Conversation
  sendMessage: async (
    conversationId: string,
    content: string
  ): Promise<Message> => {
    const response = await apiClient.post<Message>(
      `/support/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data;
  },

  // Close Conversation
  closeConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await apiClient.patch<Conversation>(
      `/support/conversations/${conversationId}/close`
    );
    return response.data;
  },

  // Get Messages for a Conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await apiClient.get<Message[] | { items: Message[] }>(
      `/support/conversations/${conversationId}/messages`
    );
    // Handle both array and paginated response formats
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).items || [];
  },
};

// React Query Hooks

export const useCreateTicket = () => {
  return useMutation({
    mutationFn: supportApi.createTicket,
  });
};

export const useGetConversations = (
  params?: GetConversationsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["conversations", params],
    queryFn: () => supportApi.getConversations(params),
    enabled,
  });
};

export const useGetCustomerConversations = (
  params?: GetCustomerConversationsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["customer-conversations", params],
    queryFn: () => supportApi.getCustomerConversations(params),
    enabled,
  });
};

export const useGetConversation = (
  conversationId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => supportApi.getConversation(conversationId),
    enabled: enabled && !!conversationId,
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => supportApi.sendMessage(conversationId, content),
  });
};

export const useCloseConversation = () => {
  return useMutation({
    mutationFn: supportApi.closeConversation,
  });
};

export const useGetMessages = (
  conversationId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => supportApi.getMessages(conversationId),
    enabled: enabled && !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds for near-real-time
    refetchIntervalInBackground: false,
  });
};
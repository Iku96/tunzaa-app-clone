import React, { createContext, useContext, ReactNode } from 'react';

// Stubbed chat context to avoid breaking existing imports
interface ChatContextType {
  client: null;
  user: null;
  isConnected: false;
  isLoading: false;
  error: string | null;
  getOrCreateDirectChannel: (vendorProfileId: string, buyerProfileId: string) => Promise<null>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

// Stubbed ChatProvider that doesn't use stream-chat
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const stubContextValue: ChatContextType = {
    client: null,
    user: null,
    isConnected: false,
    isLoading: false,
    error: "Chat functionality is currently disabled",
    getOrCreateDirectChannel: async () => {
      console.warn('Chat functionality is not available');
      return null;
    },
  };

  return (
    <ChatContext.Provider value={stubContextValue}>
      {children}
    </ChatContext.Provider>
  );
}; 
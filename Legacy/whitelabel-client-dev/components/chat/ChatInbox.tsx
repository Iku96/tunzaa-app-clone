import React from 'react';
import { View, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';

interface ChatInboxProps {
  userRole: 'buyer' | 'vendor' | 'winga';
}

const ChatInbox: React.FC<ChatInboxProps> = ({ userRole }) => {
  const resolvedColors = useResolvedThemeColors();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <MessageCircle size={48} color={resolvedColors?.mutedForeground || '#666666'} />
      <Text className="text-lg font-medium text-foreground mt-4 mb-2">
        Chat Not Available
      </Text>
      <Text className="text-center text-muted-foreground">
        Chat functionality is currently disabled. This feature will be available in a future update.
      </Text>
    </View>
  );
};

export default ChatInbox; 
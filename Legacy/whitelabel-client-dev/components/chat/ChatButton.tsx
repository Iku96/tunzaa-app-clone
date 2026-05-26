import React from 'react';
import { MessageCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';
import * as Burnt from "burnt";

interface ChatButtonProps {
  vendorId: string;
  vendorName: string;
  productId?: string;
  productName?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({
  vendorId,
  vendorName,
  productId,
  productName,
}) => {
  const resolvedColors = useResolvedThemeColors();

  const handleChatPress = () => {
    Burnt.toast({
      title: "Chat Not Available",
      preset: "error",
      message: "Chat functionality is currently disabled.",
      haptic: "error",
      duration: 3,
      from: "top",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onPress={handleChatPress}
      className="flex-row items-center"
      disabled
    >
      <MessageCircle size={16} color={resolvedColors?.mutedForeground || '#666666'} className="mr-2" />
      <Text className="text-sm text-muted-foreground">
        Chat with {vendorName}
      </Text>
    </Button>
  );
};

export default ChatButton; 
import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const resolvedColors = useResolvedThemeColors();

  const ChatHeader = () => (
    <View className="flex-row items-center justify-between p-4 border-b border-border bg-card">
      <View className="flex-row items-center flex-1">
        <Button
          variant="ghost"
          size="icon"
          onPress={() => router.back()}
          className="mr-3"
        >
          <ArrowLeft size={24} color={resolvedColors?.foreground || '#000000'} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Chat
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ChatHeader />
      
      <View className="flex-1 items-center justify-center p-6">
        <MessageCircle size={48} color={resolvedColors?.mutedForeground || '#666666'} />
        <Text className="text-lg font-medium text-foreground mt-4 mb-2">
          Chat Not Available
        </Text>
        <Text className="text-center text-muted-foreground mb-6">
          Chat functionality is currently disabled. This feature will be available in a future update.
        </Text>
        
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen; 
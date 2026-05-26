import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { ChatInbox } from '@/components/chat';
import { useAuth } from '@/context/auth';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';
import { Button } from '@/components/ui/button';

export default function BuyerInboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedColors = useResolvedThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'right', 'left']}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <View className="flex-row items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onPress={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft size={24} color={resolvedColors?.foreground || '#000000'} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">Messages</Text>
        </View>
        
        <View className="flex-row items-center">
          <MessageCircle size={24} color={resolvedColors?.foreground || '#000000'} />
        </View>
      </View>

      {/* Chat Inbox */}
      <ChatInbox userRole="buyer" />
    </SafeAreaView>
  );
} 
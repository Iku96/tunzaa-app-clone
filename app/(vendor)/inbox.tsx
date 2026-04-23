import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Users } from 'lucide-react-native';
import { ChatInbox } from '@/components/chat';
import { useAuth } from '@/context/auth';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/hooks/useI18n';

export default function VendorInboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();

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
          <Text className="text-lg font-semibold text-foreground">{t("inbox.customer_messages")}</Text>
        </View>
        
        <View className="flex-row items-center">
          <Users size={24} color={resolvedColors?.foreground || '#000000'} />
        </View>
      </View>

      {/* Chat Inbox */}
      <ChatInbox userRole="vendor" />
    </SafeAreaView>
  );
} 
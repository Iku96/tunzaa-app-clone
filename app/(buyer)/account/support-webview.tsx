import { useState } from "react";
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Mail } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react-native";
import { WebViewScreen } from "@/components/ui/webview";
import { useAuth } from "@/context/auth";
import { chatwootConfig } from "@/config/chatwoot";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

export default function SupportWebViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChatwootWebView, setShowChatwootWebView] = useState(false);
  const handleSubmit = async () => {
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChatwootWebView = () => {
    setShowChatwootWebView(true);
  };

  const handleCloseChatwootWebView = () => {
    setShowChatwootWebView(false);
  };

  // Generate Chatwoot widget URL with user data
  const getChatwootWebURL = () => {
    const baseUrl = chatwootConfig.baseUrl;
    const websiteToken = chatwootConfig.websiteToken;
    
    // Create user data for Chatwoot
    const userParams = new URLSearchParams({
      user_email: user?.email || '',
      user_name: user?.name || 'Anonymous User',
      user_id: user?.user_id || 'anonymous',
      account_type: user?.activeProfileRole || 'buyer',
      is_verified: user?.is_verified ? 'true' : 'false',
    });

    // Construct the Chatwoot widget URL
    return `${baseUrl}/widget?website_token=${websiteToken}&${userParams.toString()}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          {t("support.help_and_support")}
        </Text>
        <View className="w-6" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="p-4 border-b border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t("support.contact_us")}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              {t("support.need_help_here_to_assist")}
            </Text>

            <View className="flex-row flex-wrap gap-3">
              <Card className="flex-1 min-w-[45%]">
                <CardContent className="p-4 items-center gap-2">
                  <Phone size={24} className="text-success" />
                  <Text className="text-base font-semibold text-foreground">
                    {t("support.call_us")}
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center">
                    {t("support.speak_with_support_team")}
                  </Text>
                </CardContent>
              </Card>

              <TouchableOpacity onPress={handleOpenChatwootWebView}>
                <Card className="flex-1 min-w-[45%]">
                  <CardContent className="p-4 items-center gap-2">
                    <MessageCircle size={24} className="text-primary" />
                    <Text className="text-base font-semibold text-foreground">
                      {t("support.live_chat")}
                    </Text>
                    <Text className="text-sm text-muted-foreground text-center">
                      {t("support.chat_with_us_real_time")}
                    </Text>
                  </CardContent>
                </Card>
              </TouchableOpacity>

              <Card className="flex-1 min-w-[45%]">
                <CardContent className="p-4 items-center gap-2">
                  <Mail size={24} className="text-purple-500" />
                  <Text className="text-base font-semibold text-foreground">
                    {t("support.email")}
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center">
                    {t("support.send_us_email")}
                  </Text>
                </CardContent>
              </Card>
            </View>
          </View>

          {/* System Status */}
          <View className="p-4 border-b border-border bg-secondary/10">
            <Text className="text-sm font-semibold text-foreground mb-2">
              {t("support.support_system_status")}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Server: {chatwootConfig.baseUrl}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Method: WebView (Reliable Alternative)
            </Text>
            <Text className="text-xs text-muted-foreground">
              Status: ✅ Bypassing Native Widget Issues
            </Text>
          </View>

          <View className="p-4 border-b border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {t("support.submit_ticket")}
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                {t("support.subject")}
              </Text>
              <Input
                value={subject}
                onChangeText={setSubject}
                placeholder={t("support.what_can_we_help")}
                editable={!isSubmitting}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                {t("support.message")}
              </Text>
              <Input
                value={message}
                onChangeText={setMessage}
                placeholder={t("support.describe_issue_detail_placeholder")}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!isSubmitting}
                className="min-h-[120px]"
              />
            </View>

            <Button
              onPress={handleSubmit}
              disabled={!subject || !message || isSubmitting}
            >
              {isSubmitting ? t("support.submitting") : t("support.submit_ticket")}
            </Button>
          </View>

          {/* <View className="p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {t("support.faq")}
            </Text>
            <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
              <Text className="text-base text-foreground">
                {t("support.faq_track_order")}
              </Text>
              <ChevronRight size={20} className="text-muted-foreground" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
              <Text className="text-base text-foreground">
                {t("support.faq_payment_methods")}
              </Text>
              <ChevronRight size={20} className="text-muted-foreground" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
              <Text className="text-base text-foreground">
                {t("support.faq_cancel_order")}
              </Text>
              <ChevronRight size={20} className="text-muted-foreground" />
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Chatwoot WebView */}
      {showChatwootWebView && (
        <View className="absolute inset-0 z-50">
          <WebViewScreen
            url={getChatwootWebURL()}
            title={t("support.support_chat")}
            onClose={handleCloseChatwootWebView}
          />
        </View>
      )}
    </SafeAreaView>
  );
} 
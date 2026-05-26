import { useState } from "react";
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Phone, Mail, ChevronRight, MessageCircle } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopLayoutWrapper } from "@/components/layout";
import { useTenantStore } from "@/stores/tenant";
import { useAuth } from "@/context/auth";
import SafeChatwootWrapper from "@/components/ChatwootWidget/SafeChatwootWrapper";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function SupportScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { tenant } = useTenantStore();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const resolvedColors = useResolvedThemeColors();

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

  const handlePhoneClick = () => {
    if (tenant?.admin_phone) {
      const supportPhone = tenant?.metadata?.support_phone || tenant.admin_phone;
      Linking.openURL(`tel:${supportPhone}`).catch((err) =>
        console.error("Failed to open phone URL:", err)
      );
    } else {
      console.warn("Admin phone not available");
    }
  };

  const handleEmailClick = () => {
    if (tenant?.admin_email) {
      const supportEmail = tenant?.metadata?.support_email || tenant.admin_email;
      Linking.openURL(`mailto:${supportEmail}`).catch((err) =>
        console.error("Failed to open email URL:", err)
      );
    } else {
      console.warn("Admin email not available");
    }
  };

  const handleChatClick = () => {
    setIsChatVisible(true);
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showSecondaryNav={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        {!isDesktop && (
          <View className="flex-row justify-between items-center p-4 border-b border-border">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              Help & Support
            </Text>
            <View className="w-6" />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className={`flex-1 ${isDesktop ? 'max-w-4xl mx-auto' : ''}`} keyboardShouldPersistTaps="handled">
            <View className="p-4 border-b border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Contact Us
              </Text>
              <Text className="text-sm text-muted-foreground mb-4">
                Need help? We're here to assist you. Choose how you'd like to reach us.
              </Text>

              <View className="flex-row flex-wrap gap-3">
                <Card className="flex-1 min-w-[45%]">
                  <TouchableOpacity onPress={handlePhoneClick} disabled={!tenant?.admin_phone}>
                    <CardContent className="p-4 items-center gap-2">
                      <Phone size={24} className="text-primary" color={resolvedColors?.primary || "#000000"} />
                      <Text className="text-base font-semibold text-foreground">
                        Call Us
                      </Text>
                      <Text className="text-sm text-muted-foreground text-center">
                        {tenant?.metadata?.support_phone || "Phone not available"}
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card>

                {/* <Card className="flex-1 min-w-[45%]">
                  <TouchableOpacity onPress={handleChatClick}>
                    <CardContent className="p-4 items-center gap-2">
                      <MessageCircle size={24} className="text-primary" />
                      <Text className="text-base font-semibold text-foreground">
                        Live Chat
                      </Text>
                      <Text className="text-sm text-muted-foreground text-center">
                        Chat with us in real-time
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card> */}

                <Card className="flex-1 min-w-[45%]">
                  <TouchableOpacity onPress={handleEmailClick} disabled={!tenant?.admin_email}>
                    <CardContent className="p-4 items-center gap-2">
                      <Mail size={24} className="text-primary" color={resolvedColors?.primary || "#000000"} />
                      <Text className="text-base font-semibold text-foreground">
                        Email
                      </Text>
                      <Text className="text-sm text-muted-foreground text-center">
                        {tenant?.metadata?.support_email || "support@afrizon.africa"}
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card>
              </View>
            </View>

            {/* <View className="p-4 border-b border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Submit a Ticket
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Subject
                </Text>
                <Input
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="What can we help you with?"
                  editable={!isSubmitting}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Message
                </Text>
                <Input
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your issue in detail"
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
                <Text>{isSubmitting ? "Submitting..." : "Submit Ticket"}</Text>
              </Button>
            </View> */}

            {/* <View className="p-4">
              <Text className="text-lg font-semibold text-foreground mb-4">
                FAQs
              </Text>
              <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
                <Text className="text-base text-foreground">
                  How do I track my order?
                </Text>
                <ChevronRight size={20} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
                <Text className="text-base text-foreground">
                  What payment methods do you accept?
                </Text>
                <ChevronRight size={20} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
                <Text className="text-base text-foreground">
                  How can I cancel my order?
                </Text>
                <ChevronRight size={20} className="text-muted-foreground" />
              </TouchableOpacity>
            </View> */}
          </ScrollView>

          {/* Floating Chat Button */}
          {!isChatVisible && (
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => setIsChatVisible(true)}
            >
              <MessageCircle size={28} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Chatwoot Modal */}
          <SafeChatwootWrapper
            websiteToken="jn5LtxocshE4YWqTSdTMTWVS"
            baseUrl="https://support.afrizon.africa"
            user={user}
            isModalVisible={isChatVisible}
            closeModal={() => setIsChatVisible(false)}
            locale="en"
            colorScheme="dark"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
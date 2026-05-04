import { useState } from "react";
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import ChatwootWidget from "@/components/ChatwootWidget";
import SafeChatwootWrapper from "@/components/ChatwootWidget/SafeChatwootWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTenantStore } from "@/stores/tenant";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function SupportScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useTunzaaAuth();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { tenant } = useTenantStore();
  const resolvedColors = useResolvedThemeColors();

  console.log("Tenant in SupportScreen:", tenant);
  usePageTitle("Support");

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

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showSecondaryNav={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <SafeAreaView className={`flex-1 bg-background ${isDesktop ? "px-16 py-10" : ""}`}>
        {!isDesktop && (
          <View
            className={`flex-row justify-between items-center p-4 border-b border-border ${isDesktop ? "max-w-4xl mx-auto" : ""
              }`}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={isDesktop ? 28 : 24} className="text-foreground" />
            </TouchableOpacity>
            <Text
              className={`text-lg font-semibold text-foreground ${isDesktop ? "text-xl" : ""}`}
            >
              Help & Support
            </Text>
            <View className="w-6" />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className={`flex-1 ${isDesktop ? "max-w-4xl mx-auto" : ""}`}
            keyboardShouldPersistTaps="handled"
          >
            <View className={`p-4 border-b border-border ${isDesktop ? "p-6" : ""}`}>
              <Text
                className={`text-lg font-semibold text-foreground mb-2 ${isDesktop ? "text-xl" : ""}`}
              >
                Contact Us
              </Text>
              <Text
                className={`text-sm text-muted-foreground mb-4 ${isDesktop ? "text-base max-w-2xl" : ""}`}
              >
                Need help? We're here to assist you. Choose how you'd like to reach us.
              </Text>

              <View className={`flex-row flex-wrap gap-3 ${isDesktop ? "gap-6" : ""}`}>
                <Card className={`flex-1 ${isDesktop ? "min-w-[200px]" : "min-w-[45%]"}`}>
                  <TouchableOpacity onPress={handlePhoneClick} disabled={!tenant?.admin_phone}>
                    <CardContent className={`p-4 items-center gap-2 ${isDesktop ? "p-6" : ""}`}>
                      <Phone size={isDesktop ? 32 : 24} className="text-primary" color={resolvedColors?.primary || "#000000"} />
                      <Text
                        className={`text-base font-semibold text-foreground ${isDesktop ? "text-lg" : ""}`}
                      >
                        Call Us
                      </Text>
                      <Text
                        className={`text-sm text-muted-foreground text-center ${isDesktop ? "text-base" : ""}`}
                      >
                        {tenant?.metadata?.support_phone || "Phone not available"}
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card>

                {/* <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                  <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                    <MessageCircle size={isDesktop ? 32 : 24} className="text-primary" />
                    <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                      Live Chat
                    </Text>
                    <Text className={`text-sm text-muted-foreground text-center ${isDesktop ? 'text-base' : ''}`}>
                      Chat with us in real-time
                    </Text>
                  </CardContent>
                </Card> */}

                <Card className={`flex-1 ${isDesktop ? "min-w-[200px]" : "min-w-[45%]"}`}>
                  <TouchableOpacity onPress={handleEmailClick} disabled={!tenant?.admin_email}>
                    <CardContent className={`p-4 items-center gap-2 ${isDesktop ? "p-6" : ""}`}>
                      <Mail size={isDesktop ? 32 : 24} className="text-primary" color={resolvedColors?.primary || "#000000"} />
                      <Text
                        className={`text-base font-semibold text-foreground ${isDesktop ? "text-lg" : ""}`}
                      >
                        Email
                      </Text>
                      <Text
                        className={`text-sm text-muted-foreground text-center ${isDesktop ? "text-base" : ""}`}
                      >
                        {tenant?.metadata?.support_email || "support@afrizon.africa"}
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card>
              </View>
            </View>

            {/* <View className={`p-4 border-b border-border ${isDesktop ? "p-6" : ""}`}>
              <Text
                className={`text-lg font-semibold text-foreground mb-4 ${isDesktop ? "text-xl" : ""}`}
              >
                Submit a Ticket
              </Text>

              <View className={`mb-4 ${isDesktop ? "max-w-lg" : ""}`}>
                <Text
                  className={`text-sm font-semibold text-foreground mb-2 ${isDesktop ? "text-base" : ""}`}
                >
                  Subject
                </Text>
                <Input
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="What can we help you with?"
                  editable={!isSubmitting}
                  className={isDesktop ? "text-base py-3" : ""}
                />
              </View>

              <View className={`mb-4 ${isDesktop ? "max-w-lg" : ""}`}>
                <Text
                  className={`text-sm font-semibold text-foreground mb-2 ${isDesktop ? "text-base" : ""}`}
                >
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
                  className={`min-h-[120px] ${isDesktop ? "text-base min-h-[150px]" : ""}`}
                />
              </View>

              <Button
                onPress={handleSubmit}
                disabled={!subject || !message || isSubmitting}
                className={isDesktop ? "max-w-xs" : ""}
              >
                <Text className={isDesktop ? "text-base" : ""}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Text>
              </Button>
            </View> */}

            {/* <View className={`p-4 ${isDesktop ? "p-6" : ""}`}>
              <Text
                className={`text-lg font-semibold text-foreground mb-4 ${isDesktop ? "text-xl" : ""}`}
              >
                FAQs
              </Text>
              <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
                <Text
                  className={`text-base text-foreground ${isDesktop ? "text-lg" : ""}`}
                >
                  How do I track my order?
                </Text>
                <ChevronRight
                  size={isDesktop ? 24 : 20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
                <Text
                  className={`text-base text-foreground ${isDesktop ? "text-lg" : ""}`}
                >
                  What payment methods do you accept?
                </Text>
                <ChevronRight
                  size={isDesktop ? 24 : 20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-border">
                <Text
                  className={`text-base text-foreground ${isDesktop ? "text-lg" : ""}`}
                >
                  How can I cancel my order?
                </Text>
                <ChevronRight
                  size={isDesktop ? 24 : 20}
                  className="text-muted-foreground"
                />
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
          {Platform.OS !== "web" && (
            <SafeChatwootWrapper
              websiteToken="jn5LtxocshE4YWqTSdTMTWVS"
              baseUrl="https://support.afrizon.africaz"
              user={user}
              isModalVisible={isChatVisible}
              closeModal={() => setIsChatVisible(false)}
              locale="en"
              colorScheme="dark"
            />
          )}
          {Platform.OS === "web" && <ChatwootWidget user={user} />}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
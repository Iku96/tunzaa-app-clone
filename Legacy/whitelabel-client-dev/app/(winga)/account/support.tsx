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
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function SupportScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          Help & Support
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
              Contact Us
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Need help? We're here to assist you. Choose how you'd like to reach
              us.
            </Text>

            <View className="flex-row flex-wrap gap-3">
              <Card className="flex-1 min-w-[45%]">
                <CardContent className="p-4 items-center gap-2">
                  <Phone size={24} className="text-primary" color={resolvedColors?.success || "#000000"} />
                  <Text className="text-base font-semibold text-foreground">
                    Call Us
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center">
                    Speak with our support team
                  </Text>
                </CardContent>
              </Card>

              <Card className="flex-1 min-w-[45%]">
                <CardContent className="p-4 items-center gap-2">
                  <MessageCircle size={24} className="text-primary" color={resolvedColors?.primary || "#000000"} />
                  <Text className="text-base font-semibold text-foreground">
                    Live Chat
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center">
                    Chat with us in real-time
                  </Text>
                </CardContent>
              </Card>

              <Card className="flex-1 min-w-[45%]">
                <CardContent className="p-4 items-center gap-2">
                  <Mail size={24} className="text-primary" color={resolvedColors?.primary || "#000000"} />
                  <Text className="text-base font-semibold text-foreground">
                    Email
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center">
                    Send us an email
                  </Text>
                </CardContent>
              </Card>
            </View>
          </View>

          <View className="p-4 border-b border-border">
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
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </View>

          <View className="p-4">
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

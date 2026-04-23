import { useState } from "react";
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronRight, Clock, AlertCircle, CheckCircle, XCircle, Package, ChevronDown, ChevronUp } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import SafeChatwootWrapper from "@/components/ChatwootWidget/SafeChatwootWrapper";
import { useAuth } from "@/context/auth";
import { useGetCustomerConversations, type Conversation } from "@/services/support";
import { useI18n } from "@/hooks/useI18n";
import { useTenantStore } from "@/stores/tenant";
import { TicketDetailsModal } from "@/components/modals/TicketDetailsModal";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function SupportScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { user } = useAuth();
  const { t } = useI18n();
  const { tenant } = useTenantStore();
  usePageTitle(t("support.support_and_help"));

  const resolvedColors = useResolvedThemeColors();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Conversation | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [chatCustomAttributes, setChatCustomAttributes] = useState<Record<string, any> | undefined>(undefined);

  // Fetch tickets
  const { data, isLoading, error } = useGetCustomerConversations({
    limit: 20,
    offset: 0,
  });

  const tickets = data?.data?.conversations || [];
  const totalTickets = data?.data?.total || 0;
  const displayedTickets = showAllTickets ? tickets : tickets.slice(0, 5);
  const hasMoreTickets = tickets.length > 5;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-blue-600";
      case "in-progress": return "text-amber-600";
      case "pending": return "text-amber-600";
      case "resolved": return "text-green-600";
      case "closed": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-50";
      case "in-progress": return "bg-amber-50";
      case "pending": return "bg-amber-50";
      case "resolved": return "bg-green-50";
      case "closed": return "bg-gray-50";
      default: return "bg-gray-50";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("support.just_now");
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "order":
        return <Package size={14} className="text-blue-600" />;
      case "payment":
        return <Mail size={14} className="text-purple-600" />;
      case "technical":
        return <AlertCircle size={14} className="text-orange-600" />;
      default:
        return <MessageCircle size={14} className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <MessageCircle size={14} className="text-blue-600" />;
      case "in-progress":
      case "pending":
        return <Clock size={14} className="text-amber-600" />;
      case "resolved":
        return <CheckCircle size={14} className="text-green-600" />;
      case "closed":
        return <XCircle size={14} className="text-gray-600" />;
      default:
        return <MessageCircle size={14} className="text-gray-600" />;
    }
  };

  const handleTicketClick = (ticket: Conversation) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleContinueConversation = () => {
    if (selectedTicket) {
      // Set custom attributes with ticket context
      setChatCustomAttributes({
        ticket_id: selectedTicket.id,
        conversation_id: selectedTicket.chatwoot_conversation_id || selectedTicket.id,
        order_id: selectedTicket.order_id,
        subject: selectedTicket.subject,
        category: selectedTicket.category,
        priority: selectedTicket.priority,
        source: "support_ticket_list",
      });

      // Close details modal and open chat
      setShowTicketDetails(false);
      setIsChatVisible(true);
    }
  };

  const handleCloseChatAndResetContext = () => {
    setIsChatVisible(false);
    setChatCustomAttributes(undefined);
    setSelectedTicket(null);
  };

  const handleSubmit = async () => {
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
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
      <SafeAreaView className={`flex-1 bg-background ${isDesktop ? 'px-16 py-10' : ''}`} edges={["top", "right", "left"]}>
        {!isDesktop && (
          <View className={`flex-row justify-between items-center p-4 border-b border-border`}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
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

            {/* Contact Cards */}
            <View className={`p-4 border-b border-border ${isDesktop ? 'p-6' : ''}`}>
              <Text className={`text-lg font-semibold text-foreground mb-2 ${isDesktop ? 'text-xl' : ''}`}>
                Contact Us
              </Text>
              <Text className={`text-sm text-muted-foreground mb-4 ${isDesktop ? 'text-base max-w-2xl' : ''}`}>
                Need help? Choose your preferred contact method
              </Text>

              <View className={`flex-row flex-wrap gap-3 ${isDesktop ? 'gap-6' : ''}`}>
                <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                  <TouchableOpacity onPress={handlePhoneClick} disabled={!tenant?.admin_phone}>
                    <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                      <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mb-1">
                        <Phone size={24} className="text-green-600" />
                      </View>
                      <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                        Call Us
                      </Text>
                      <Text className={`text-xs text-muted-foreground text-center ${isDesktop ? 'text-base' : ''}`}>
                        {tenant?.metadata?.support_phone || "Phone not available"}
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card>

                {/* <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                  <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                    <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
                      <MessageCircle size={24} className="text-blue-600" />
                    </View>
                    <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                      Live Chat
                    </Text>
                    <Text className={`text-xs text-muted-foreground text-center ${isDesktop ? 'text-base' : ''}`}>
                      Chat in real-time
                    </Text>
                  </CardContent>
                </Card> */}

                <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                  <TouchableOpacity onPress={handleEmailClick} disabled={!tenant?.admin_email}>
                    <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                      <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mb-1">
                        <Mail size={24} className="text-purple-600" />
                      </View>
                      <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                        Email
                      </Text>
                      <Text className={`text-xs text-muted-foreground text-center ${isDesktop ? 'text-base' : ''}`}>
                        {tenant?.metadata?.support_email || "support@afrizon.africa"}
                      </Text>
                    </CardContent>
                  </TouchableOpacity>
                </Card>
              </View>
            </View>

            {/* My Tickets Section */}
            <View className={`p-4 border-b border-border ${isDesktop ? 'p-6' : ''}`}>
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text className={`text-xl font-bold text-foreground ${isDesktop ? 'text-2xl' : ''}`}>
                    My Tickets
                  </Text>
                  {totalTickets > 0 && (
                    <Text className="text-xs text-muted-foreground mt-1">
                      {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}
                    </Text>
                  )}
                </View>
              </View>

              {isLoading ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="large" color="#0066FF" />
                  <Text className="text-muted-foreground mt-2 text-sm">Loading tickets...</Text>
                </View>
              ) : error ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex-row items-center">
                    <XCircle size={20} className="text-red-600 mr-2" />
                    <View className="flex-1">
                      <Text className="text-red-600 font-semibold text-sm">
                        Failed to load tickets
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              ) : tickets.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 items-center">
                    <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-3">
                      <MessageCircle size={28} className="text-blue-600" />
                    </View>
                    <Text className="text-base font-semibold text-foreground text-center mb-1">
                      No support tickets yet
                    </Text>
                    <Text className="text-xs text-muted-foreground text-center">
                      Submit a ticket below if you need help
                    </Text>
                  </CardContent>
                </Card>
              ) : (
                <View className="gap-2">
                  {displayedTickets.map((ticket) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => handleTicketClick(ticket)}
                      activeOpacity={0.7}
                    >
                      <Card className="border-l-4 border-l-primary">
                        <CardContent className="p-3">
                          {/* Header */}
                          <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1 mr-2">
                              <View className="flex-row items-center mb-1">
                                {getCategoryIcon(ticket.category)}
                                <Text className="font-mono text-xs text-muted-foreground ml-1">
                                  #{ticket.chatwoot_conversation_id || ticket.id.slice(0, 8).toUpperCase()}
                                </Text>
                              </View>
                              <Text className="font-semibold text-sm text-foreground leading-5" numberOfLines={2}>
                                {ticket.subject}
                              </Text>
                            </View>

                            <View className={`px-2 py-1 rounded-full ${getStatusBgColor(ticket.status)}`}>
                              <View className="flex-row items-center gap-1">
                                {getStatusIcon(ticket.status)}
                                <Text className={`text-xs font-semibold capitalize ${getStatusColor(ticket.status)}`}>
                                  {ticket.status === "in-progress" ? t("support.active") : ticket.status}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Metadata */}
                          <View className="flex-row items-center justify-between pt-2 border-t border-border">
                            <View className="flex-row items-center gap-3">
                              <View className="flex-row items-center gap-1">
                                <View className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`} />
                                <Text className="text-xs text-muted-foreground capitalize">
                                  {ticket.priority}
                                </Text>
                              </View>
                              <View className="flex-row items-center gap-1">
                                <Clock size={12} className="text-muted-foreground" />
                                <Text className="text-xs text-muted-foreground">
                                  {formatDate(ticket.updated_at)}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-xs text-primary font-semibold">
                              Open →
                            </Text>
                          </View>
                        </CardContent>
                      </Card>
                    </TouchableOpacity>
                  ))}

                  {/* View More/Less Button */}
                  {hasMoreTickets && (
                    <TouchableOpacity
                      onPress={() => setShowAllTickets(!showAllTickets)}
                      className="mt-1 p-3 border border-border rounded-lg bg-card active:bg-muted/50"
                    >
                      <View className="flex-row items-center justify-center gap-2">
                        {showAllTickets ? (
                          <>
                            <ChevronUp size={16} className="text-primary" />
                            <Text className="text-sm font-semibold text-primary">
                              Show Less
                            </Text>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} className="text-primary" />
                            <Text className="text-sm font-semibold text-primary">
                              View All {tickets.length} Tickets
                            </Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>



            {/* Submit Ticket Form */}
            {/* <View className={`p-4 border-b border-border ${isDesktop ? 'p-6' : ''}`}>
              <Text className={`text-lg font-semibold text-foreground mb-1 ${isDesktop ? 'text-xl' : ''}`}>
                Submit a New Ticket
              </Text>
              <Text className="text-sm text-muted-foreground mb-4">
                Describe your issue and we'll help resolve it
              </Text>

              <View className={`mb-4 ${isDesktop ? 'max-w-lg' : ''}`}>
                <Text className={`text-sm font-semibold text-foreground mb-2 ${isDesktop ? 'text-base' : ''}`}>
                  Subject *
                </Text>
                <Input
                  value={subject}
                  onChangeText={setSubject}
                  placeholder={t("support.brief_summary_placeholder")}
                  editable={!isSubmitting}
                  className={isDesktop ? 'text-base py-3' : ''}
                />
              </View>

              <View className={`mb-4 ${isDesktop ? 'max-w-lg' : ''}`}>
                <Text className={`text-sm font-semibold text-foreground mb-2 ${isDesktop ? 'text-base' : ''}`}>
                  Message *
                </Text>
                <Input
                  value={message}
                  onChangeText={setMessage}
                  placeholder={t("support.describe_issue_detail_placeholder")}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                  className={`min-h-[120px] ${isDesktop ? 'text-base min-h-[150px]' : ''}`}
                />
              </View>

              <Button
                onPress={handleSubmit}
                disabled={!subject || !message || isSubmitting}
                className={isDesktop ? 'max-w-xs' : ''}
              >
                <Text className={`text-white ${isDesktop ? 'text-base' : ''}`}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Text>
              </Button>
            </View> */}

            {/* FAQs */}
            {/* <View className={`p-4 ${isDesktop ? 'p-6' : ''}`}>
              <Text className={`text-lg font-semibold text-foreground mb-4 ${isDesktop ? 'text-xl' : ''}`}>
                Frequently Asked Questions
              </Text>
              {["How do I track my order?", "What payment methods do you accept?", "How can I cancel my order?"].map((faq, idx) => (
                <TouchableOpacity key={idx} className="flex-row justify-between items-center p-3 mb-2 bg-card rounded-lg border border-border">
                  <Text className={`text-sm text-foreground flex-1 ${isDesktop ? 'text-base' : ''}`}>{faq}</Text>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </TouchableOpacity>
              ))}
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

          {/* Ticket Details Modal */}
          <TicketDetailsModal
            visible={showTicketDetails}
            ticket={selectedTicket}
            onClose={() => {
              setShowTicketDetails(false);
              setSelectedTicket(null);
            }}
            onContinueConversation={handleContinueConversation}
          />

          {/* Chatwoot Modal */}
          <SafeChatwootWrapper
            websiteToken="jn5LtxocshE4YWqTSdTMTWVS"
            baseUrl="https://support.afrizon.africa"
            user={user}
            isModalVisible={isChatVisible}
            closeModal={handleCloseChatAndResetContext}
            locale="en"
            colorScheme="dark"
            customAttributes={chatCustomAttributes}
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
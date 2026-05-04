import { useState } from "react";
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronRight, Clock, AlertCircle, CheckCircle, XCircle, Package, ArrowUpRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import ChatwootWidget from "../ChatwootWidget";
import { useAuth } from "@/context/auth";
import { useGetCustomerConversations } from "@/src/services/support";
import { useI18n } from "@/hooks/useI18n";
import { useTenantStore } from "@/stores/tenant";

export default function SupportScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();
  const { user } = useAuth();
  const { tenant } = useTenantStore();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);

  // Fetch recent tickets
  const { data, isLoading, error } = useGetCustomerConversations({
    limit: 20,
    offset: 0,
  });

  const tickets = data?.data?.conversations || [];
  const totalTickets = data?.data?.total || 0;

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

    if (diffMins < 1) return "Just now";
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
        return <MessageCircle size={16} className="text-blue-600" />;
      case "in-progress":
      case "pending":
        return <Clock size={16} className="text-amber-600" />;
      case "resolved":
        return <CheckCircle size={16} className="text-green-600" />;
      case "closed":
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <MessageCircle size={16} className="text-gray-600" />;
    }
  };

  const handleTicketClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSubmit = async () => {
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement ticket creation API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = () => {
    if (tenant?.admin_phone) {
      Linking.openURL(`tel:${tenant.admin_phone}`).catch((err) =>
        console.error("Failed to open phone URL:", err)
      );
    } else {
      console.warn("Admin phone not available");
    }
  };

  const handleEmailClick = () => {
    if (tenant?.admin_email) {
      Linking.openURL(`mailto:${tenant.admin_email}`).catch((err) =>
        console.error("Failed to open email URL:", err)
      );
    } else {
      console.warn("Admin email not available");
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-background`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className={`flex-1`} keyboardShouldPersistTaps="handled">
          {/* My Tickets Section */}
          <View className={`p-4 border-b border-border ${isDesktop ? 'p-6' : ''}`}>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className={`text-2xl font-bold text-foreground ${isDesktop ? 'text-3xl' : ''}`}>
                  {t("support.my_support_tickets")}
                </Text>
                {totalTickets > 0 && (
                  <Text className="text-sm text-muted-foreground mt-1">
                    {t("support.active_conversations", { count: totalTickets })}
                  </Text>
                )}
              </View>
            </View>

            {isLoading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color="#0066FF" />
                <Text className="text-muted-foreground mt-3">{t("support.loading_your_tickets")}</Text>
              </View>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 flex-row items-center">
                  <XCircle size={24} className="text-red-600 mr-3" />
                  <View className="flex-1">
                    <Text className="text-red-600 font-semibold mb-1">
                      {t("support.failed_to_load_tickets")}
                    </Text>
                    <Text className="text-red-500 text-sm">
                      {t("support.please_try_again_later")}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ) : tickets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 items-center">
                  <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-blue-600" />
                  </View>
                  <Text className="text-lg font-semibold text-foreground text-center mb-2">
                    {t("support.no_support_tickets_yet")}
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center max-w-xs">
                    {t("support.submit_ticket_below")}
                  </Text>
                </CardContent>
              </Card>
            ) : (
              <View>
                {/* Table Header */}
                <View className="bg-muted/50 rounded-t-lg border border-border p-3">
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-muted-foreground uppercase">
                        {t("support.ticket")}
                      </Text>
                    </View>
                    <View className="w-24 items-center">
                      <Text className="text-xs font-semibold text-muted-foreground uppercase">
                        {t("support.status")}
                      </Text>
                    </View>
                    <View className="w-20 items-center">
                      <Text className="text-xs font-semibold text-muted-foreground uppercase">
                        {t("support.priority")}
                      </Text>
                    </View>
                    <View className="w-24 items-end">
                      <Text className="text-xs font-semibold text-muted-foreground uppercase">
                        {t("support.updated")}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Table Body */}
                <View className="border-x border-b border-border rounded-b-lg overflow-hidden">
                  {tickets.map((ticket, index) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => handleTicketClick(ticket.chatwoot_conversation_id || ticket.id)}
                      activeOpacity={0.7}
                      className={`${index !== tickets.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <View className="p-3 bg-card hover:bg-muted/30 active:bg-muted/50">
                        <View className="flex-row items-center">
                          {/* Ticket Info */}
                          <View className="flex-1 pr-2">
                            <View className="flex-row items-center mb-1">
                              {getCategoryIcon(ticket.category)}
                              <Text className="font-mono text-xs text-muted-foreground ml-2">
                                #{ticket.chatwoot_conversation_id || ticket.id.slice(0, 8).toUpperCase()}
                              </Text>
                            </View>
                            <Text className="font-semibold text-sm text-foreground leading-5" numberOfLines={1}>
                              {ticket.subject}
                            </Text>
                            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                              {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} • Created {formatDate(ticket.created_at)}
                            </Text>
                          </View>

                          {/* Status */}
                          <View className="w-24 items-center px-1">
                            <View className={`px-2 py-1.5 rounded-full ${getStatusBgColor(ticket.status)}`}>
                              <View className="flex-row items-center gap-1">
                                {getStatusIcon(ticket.status)}
                                <Text className={`text-xs font-semibold capitalize ${getStatusColor(ticket.status)}`}>
                                  {ticket.status === "in-progress" ? "Active" : ticket.status}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Priority */}
                          <View className="w-20 items-center">
                            <View className="flex-row items-center gap-1.5">
                              <View className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`} />
                              <Text className="text-xs text-muted-foreground capitalize">
                                {ticket.priority}
                              </Text>
                            </View>
                          </View>

                          {/* Time */}
                          <View className="w-24 items-end">
                            <Text className="text-xs text-muted-foreground">
                              {formatDate(ticket.updated_at)}
                            </Text>
                            <View className="flex-row items-center gap-1 mt-1">
                              <Text className="text-xs text-primary font-medium">
                                Open
                              </Text>
                              <ArrowUpRight size={12} className="text-primary" />
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Contact Us Section */}
          <View className={`p-4 border-b border-border ${isDesktop ? 'p-6' : ''}`}>
            <Text className={`text-xl font-bold text-foreground mb-2 ${isDesktop ? 'text-2xl' : ''}`}>
              {t("support.contact_us")}
            </Text>
            <Text className={`text-sm text-muted-foreground mb-4 ${isDesktop ? 'text-base max-w-2xl' : ''}`}>
              {t("support.need_immediate_help")}
            </Text>

            <View className={`flex-row flex-wrap gap-3 ${isDesktop ? 'gap-4' : ''}`}>
              <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                <TouchableOpacity onPress={handlePhoneClick} disabled={!tenant?.admin_phone}>
                  <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                    <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mb-2">
                      <Phone size={24} className="text-green-600" />
                    </View>
                    <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                      {t("support.call_us")}
                    </Text>
                    <Text className={`text-xs text-muted-foreground text-center ${isDesktop ? 'text-sm' : ''}`}>
                      {tenant?.admin_phone || t("support.phone_not_available")}
                    </Text>
                  </CardContent>
                </TouchableOpacity>
              </Card>

              {/* <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                <TouchableOpacity onPress={() => handleTicketClick("")}>
                  <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                    <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                      <MessageCircle size={24} className="text-blue-600" />
                    </View>
                    <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                      {t("support.live_chat")}
                    </Text>
                    <Text className={`text-xs text-muted-foreground text-center ${isDesktop ? 'text-sm' : ''}`}>
                      {t("support.chat_in_real_time")}
                    </Text>
                  </CardContent>
                </TouchableOpacity>
              </Card> */}

              <Card className={`flex-1 ${isDesktop ? 'min-w-[200px]' : 'min-w-[45%]'}`}>
                <TouchableOpacity onPress={handleEmailClick} disabled={!tenant?.admin_email}>
                  <CardContent className={`p-4 items-center gap-2 ${isDesktop ? 'p-6' : ''}`}>
                    <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mb-2">
                      <Mail size={24} className="text-purple-600" />
                    </View>
                    <Text className={`text-base font-semibold text-foreground ${isDesktop ? 'text-lg' : ''}`}>
                      {t("support.email")}
                    </Text>
                    <Text className={`text-xs text-muted-foreground text-center ${isDesktop ? 'text-sm' : ''}`}>
                      {tenant?.admin_email || t("support.email_not_available")}
                    </Text>
                  </CardContent>
                </TouchableOpacity>
              </Card>
            </View>
          </View>

          {/* Submit a Ticket Section */}
          {/* <View className={`p-4 border-b border-border ${isDesktop ? 'p-6' : ''}`}>
            <Text className={`text-xl font-bold text-foreground mb-1 ${isDesktop ? 'text-2xl' : ''}`}>
              {t("support.submit_new_ticket")}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              {t("support.describe_issue_well_help")}
            </Text>

            <View className={`mb-4 ${isDesktop ? 'max-w-lg' : ''}`}>
              <Text className={`text-sm font-semibold text-foreground mb-2 ${isDesktop ? 'text-base' : ''}`}>
                {t("support.subject")} *
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
                {t("support.message")} *
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
                {isSubmitting ? t("support.submitting") : t("support.submit_ticket")}
              </Text>
            </Button>
          </View> */}

          {/* FAQs Section */}
          {/* <View className={`p-4 pb-8 ${isDesktop ? 'p-6' : ''}`}>
            <Text className={`text-xl font-bold text-foreground mb-4 ${isDesktop ? 'text-2xl' : ''}`}>
              {t("support.faq")}
            </Text>
            <View className="gap-2">
              <TouchableOpacity className="flex-row justify-between items-center p-4 bg-card rounded-lg border border-border">
                <Text className={`text-sm text-foreground flex-1 ${isDesktop ? 'text-base' : ''}`}>
                  {t("support.faq_track_order")}
                </Text>
                <ChevronRight size={isDesktop ? 20 : 18} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between items-center p-4 bg-card rounded-lg border border-border">
                <Text className={`text-sm text-foreground flex-1 ${isDesktop ? 'text-base' : ''}`}>
                  {t("support.faq_payment_methods")}
                </Text>
                <ChevronRight size={isDesktop ? 20 : 18} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between items-center p-4 bg-card rounded-lg border border-border">
                <Text className={`text-sm text-foreground flex-1 ${isDesktop ? 'text-base' : ''}`}>
                  {t("support.faq_cancel_order")}
                </Text>
                <ChevronRight size={isDesktop ? 20 : 18} className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
          </View> */}
        </ScrollView>

        {/* Chatwoot Widget */}
        {selectedConversationId && <ChatwootWidget
          user={user}
          conversationId={selectedConversationId}
          onWidgetReady={() => {
            console.log("Chatwoot widget is ready");
          }}
        />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
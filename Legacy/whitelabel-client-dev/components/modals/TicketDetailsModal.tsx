import React from "react";
import { View } from "react-native";
import { MessageCircle, Clock, AlertCircle, Package, Calendar } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/hooks/useI18n";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import type { Conversation } from "@/services/support";

interface TicketDetailsModalProps {
  visible: boolean;
  ticket: Conversation | null;
  onClose: () => void;
  onContinueConversation: () => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  visible,
  ticket,
  onClose,
  onContinueConversation,
}) => {
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();

  if (!ticket || !resolvedColors) return null;

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "outline";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "order":
        return <Package size={18} className="text-blue-600" />;
      case "payment":
        return <AlertCircle size={18} className="text-purple-600" />;
      case "technical":
        return <AlertCircle size={18} className="text-orange-600" />;
      default:
        return <MessageCircle size={18} className="text-gray-600" />;
    }
  };

  const footer = (
    <View className="gap-2">
      <Button
        onPress={onContinueConversation}
        className="w-full"
        style={{ backgroundColor: resolvedColors.primary }}
      >
        <View className="flex-row items-center gap-2">
          <MessageCircle size={20} color={resolvedColors.primaryForeground} />
          <Text className="text-base font-semibold" style={{ color: resolvedColors.primaryForeground }}>
            {t("support.continue_conversation")}
          </Text>
        </View>
      </Button>
      <Button
        onPress={onClose}
        variant="outline"
        className="w-full"
      >
        <Text className="text-base">{t("common.close")}</Text>
      </Button>
    </View>
  );

  return (
    <ResponsiveModal
      isOpen={visible}
      onOpenChange={onClose}
      title={t("support.ticket_details")}
      footer={footer}
      fitContent={true}
      enableScrolling={true}
    >
      <View className="gap-4 py-4">
        {/* Ticket ID & Status */}
        <Card>
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                {getCategoryIcon(ticket.category)}
                <Text className="font-mono text-sm text-muted-foreground">
                  #{ticket.chatwoot_conversation_id || ticket.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusBgColor(ticket.status)}`}>
                <Text className={`text-sm font-semibold capitalize ${getStatusColor(ticket.status)}`}>
                  {ticket.status === "in-progress" ? t("support.active") : ticket.status}
                </Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-foreground mb-2">
              {ticket.subject}
            </Text>

            <View className="flex-row items-center gap-3">
              <Badge variant={getPriorityColor(ticket.priority) as any}>
                <Text className="text-xs capitalize">{ticket.priority}</Text>
              </Badge>
              <Badge variant="outline">
                <Text className="text-xs capitalize">{ticket.category}</Text>
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardContent className="p-4">
            <Text className="text-base font-semibold text-foreground mb-3">
              {t("support.ticket_information")}
            </Text>

            <View className="gap-3">
              {/* Created Date */}
              <View className="flex-row items-start gap-3">
                <Calendar size={18} className="text-muted-foreground mt-0.5" />
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">
                    {t("support.created_at")}
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatDate(ticket.created_at)}
                  </Text>
                </View>
              </View>

              <Separator />

              {/* Last Updated */}
              <View className="flex-row items-start gap-3">
                <Clock size={18} className="text-muted-foreground mt-0.5" />
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">
                    {t("support.last_updated")}
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatDate(ticket.updated_at)}
                  </Text>
                </View>
              </View>

              {ticket.order_id && (
                <>
                  <Separator />
                  <View className="flex-row items-start gap-3">
                    <Package size={18} className="text-muted-foreground mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-xs text-muted-foreground mb-1">
                        {t("support.related_order")}
                      </Text>
                      <Text className="text-sm text-foreground font-mono">
                        {ticket.order_id.slice(0, 8).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {ticket.resolved_at && (
                <>
                  <Separator />
                  <View className="flex-row items-start gap-3">
                    <AlertCircle size={18} className="text-green-600 mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-xs text-muted-foreground mb-1">
                        {t("support.resolved_at")}
                      </Text>
                      <Text className="text-sm text-foreground">
                        {formatDate(ticket.resolved_at)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Info Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <View className="flex-row items-start gap-3">
              <MessageCircle size={18} className="text-blue-600 mt-0.5" />
              <View className="flex-1">
                <Text className="text-sm text-blue-900">
                  {t("support.continue_conversation_info")}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ResponsiveModal>
  );
};


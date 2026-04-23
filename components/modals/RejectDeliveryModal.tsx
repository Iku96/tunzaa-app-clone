import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { XCircle } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface RejectDeliveryModalProps {
  onConfirm: (reason: string) => Promise<void>;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "destructive";
  triggerSize?: "default" | "sm" | "lg";
  disabled?: boolean;
  canReject?: boolean;
}

export const RejectDeliveryModal: React.FC<RejectDeliveryModalProps> = ({
  onConfirm,
  triggerText,
  triggerVariant = "destructive",
  triggerSize = "default",
  disabled = false,
  canReject = true,
}) => {
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    if (canReject) {
      setReason("");
      setError("");
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    // Validate reason
    if (!reason.trim()) {
      setError(t("modals.reject_delivery.error_provide_reason"));
      return;
    }

    if (reason.trim().length < 10) {
      setError(t("modals.reject_delivery.error_minimum_length"));
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      await onConfirm(reason.trim());
      handleClose();
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTrigger = () => {
    if (!canReject) return null;

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-center p-4 rounded-xl gap-x-2 ${
          triggerVariant === "destructive" 
            ? "bg-destructive" 
            : triggerVariant === "outline"
            ? "border border-border bg-background"
            : triggerVariant === "secondary"
            ? "bg-secondary"
            : "bg-primary"
        }`}
        onPress={handleOpen}
        disabled={disabled}
      >
        <XCircle size={20} color="#FFFFFF" />
        <Text className={`text-base font-semibold ${
          triggerVariant === "outline" ? "text-foreground" : "text-white"
        }`}>
          {triggerText || t("modals.reject_delivery.title")}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => (
    <View className="flex-1">
      <View className="items-center mb-6">
        <View className="flex-row items-center gap-2 mb-2">
          <XCircle size={24} color={resolvedColors?.destructive || "#ef4444"} />
          <Text className="text-lg font-semibold">{t("modals.reject_delivery.title")}</Text>
        </View>
        <Text className="text-sm text-muted-foreground text-center">
          {t("modals.reject_delivery.description")}
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">
            {t("modals.reject_delivery.reason_label")} *
          </Text>
          <Textarea
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              if (error) setError("");
            }}
            placeholder={t("modals.reject_delivery.reason_placeholder")}
            multiline
            numberOfLines={4}
            className="min-h-[100px]"
            textAlignVertical="top"
            editable={!isSubmitting}
            maxLength={500}
          />
          
          <View className="flex-row justify-between items-center">
            {error ? (
              <Text className="text-xs text-destructive">{error}</Text>
            ) : (
              <Text className="text-xs text-muted-foreground">
                {t("modals.reject_delivery.minimum_chars")}
              </Text>
            )}
            <Text className="text-xs text-muted-foreground">
              {reason.length}/500
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View className="flex-row gap-3">
      <Button
        variant="outline"
        onPress={handleClose}
        disabled={isSubmitting}
        className="flex-1"
      >
        <Text className="font-semibold">{t("common.cancel")}</Text>
      </Button>
      <Button
        variant="destructive"
        onPress={handleConfirm}
        disabled={isSubmitting || !reason.trim()}
        className="flex-1"
      >
        {isSubmitting ? (
          <>
            <ActivityIndicator size="small" color="white" className="mr-2" />
            <Text className="font-semibold text-white">{t("modals.reject_delivery.submitting")}</Text>
          </>
        ) : (
          <Text className="font-semibold text-white">{t("modals.reject_delivery.reject_button")}</Text>
        )}
      </Button>
    </View>
  );

  return (
    <>
      {renderTrigger()}

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={handleClose}
        title={t("modals.reject_delivery.title")}
        snapPoints={["60%"]}
        footer={renderFooter()}
      >
        {renderContent()}
      </ResponsiveModal>
    </>
  );
};


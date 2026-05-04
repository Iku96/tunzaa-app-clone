import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Settings } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Order } from "@/src/services/types/orders";
import { useI18n } from "@/hooks/useI18n";

interface OrderStatusModalProps {
  order?: Order;
  onSubmit: (orderId: string, newStatus: string) => void;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "text-warning" },
  { value: "processing", label: "Processing", color: "text-blue-500" },
  { value: "confirmed", label: "Confirmed", color: "text-green-500" },
  { value: "shipped", label: "Shipped", color: "text-purple-500" },
  // { value: "delivered", label: "Delivered", color: "text-success" },
  // { value: "completed", label: "Completed", color: "text-success" },
  // { value: "cancelled", label: "Cancelled", color: "text-destructive" },
  // { value: "refunded", label: "Refunded", color: "text-destructive" },
  // {
  //   value: "partially_refunded",
  //   label: "Partially Refunded",
  //   color: "text-warning",
  // },
];

export function OrderStatusModal({
  order,
  onSubmit,
  triggerText,
  triggerVariant = "outline",
  triggerSize = "sm",
  disabled = false,
}: OrderStatusModalProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or order changes
  useEffect(() => {
    if (isOpen && order) {
      setSelectedStatus(order.status);
    }
  }, [isOpen, order]);

  const handleOpen = () => {
    if (order) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setIsSubmitting(true);
    try {
      await onSubmit(order.order_id, selectedStatus);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return (
      ORDER_STATUSES.find((status) => status.value === order?.status) || {
        value: order?.status || "",
        label: order?.status || "Unknown",
        color: "text-muted-foreground",
      }
    );
  };

  const getSelectedStatusInfo = () => {
    return (
      ORDER_STATUSES.find((status) => status.value === selectedStatus) || {
        value: selectedStatus,
        label: selectedStatus,
        color: "text-muted-foreground",
      }
    );
  };

  const currentStatusInfo = getCurrentStatusInfo();
  const selectedStatusInfo = getSelectedStatusInfo();

  const renderTrigger = () => {
    if (triggerSize === "icon") {
      return (
        <Button
          variant={triggerVariant}
          size="icon"
          onPress={handleOpen}
          disabled={disabled || !order}
        >
          <Settings size={16} className="text-muted-foreground" />
        </Button>
      );
    }

    return (
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onPress={handleOpen}
        disabled={disabled || !order}
        className="flex-row items-center gap-2"
      >
        <Settings size={16} className="text-muted-foreground" />
        <Text className="text-muted-foreground">
          {triggerText || t("common.update")}
        </Text>
      </Button>
    );
  };

  const renderContent = () => (
    <View className="gap-6">
      {/* Order Info */}
      <Card className="p-4">
        <Text className="text-lg font-semibold text-foreground mb-2">
          Order #{order?.order_number}
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Order ID: {order?.order_id}
        </Text>

        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-muted-foreground">{t("common.created")}</Text>
              <Text className="text-sm font-semibold text-foreground">
                {order?.created_at
                  ? format(
                      new Date(order.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )
                  : "N/A"}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">
                {t("payment.total")}
              </Text>
              <Text className="text-lg font-bold text-foreground">
                {order?.totals.total.toLocaleString()} {order?.currency}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-muted-foreground">
                {t("orders.order_status")}
              </Text>
              <Badge variant="secondary" className="mt-1">
                <Text className={`text-xs ${currentStatusInfo.color}`}>
                  {currentStatusInfo.label}
                </Text>
              </Badge>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">
                {t("orders.payment_status")}
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                {order?.payment_status}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-xs text-muted-foreground">{t("orders.items")}</Text>
            <Text className="text-sm font-semibold text-foreground">
              {order?.items.length} {t("orders.items")}
            </Text>
          </View>
        </View>
      </Card>

      {/* Status Selection */}
      <View className="gap-4">
        <Text className="text-sm font-medium">
          {t("common.select")} {t("orders.order_status")} <Text className="text-destructive">*</Text>
        </Text>

        <View className="gap-2">
          {ORDER_STATUSES.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? "default" : "outline"}
              onPress={() => setSelectedStatus(status.value)}
              className={`w-full justify-start ${
                selectedStatus === status.value ? "bg-primary" : ""
              }`}
              disabled={isSubmitting}
            >
              <View className="flex-row justify-between items-center w-full">
                <Text
                  className={`text-sm font-medium ${
                    selectedStatus === status.value
                      ? "text-white"
                      : status.color
                  }`}
                >
                  {status.label}
                </Text>
                {order?.status === status.value && (
                  <Badge variant="secondary">
                    <Text className="text-xs">{t("common.current")}</Text>
                  </Badge>
                )}
              </View>
            </Button>
          ))}
        </View>

        {/* Status Change Preview */}
        {selectedStatus && selectedStatus !== order?.status && (
          <Card className="p-4 bg-muted">
            <Text className="text-sm font-medium mb-2">
              Status Change Preview
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">{t("common.from")}</Text>
                <Text
                  className={`text-sm font-semibold ${currentStatusInfo.color}`}
                >
                  {currentStatusInfo.label}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">{t("common.to")}</Text>
                <Text
                  className={`text-sm font-semibold ${selectedStatusInfo.color}`}
                >
                  {selectedStatusInfo.label}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View className="flex-row gap-x-3">
      <Button
        variant="secondary"
        onPress={handleClose}
        disabled={isSubmitting}
        className="flex-1"
      >
        <Text className="font-semibold text-muted-foreground">{t("common.cancel")}</Text>
      </Button>

      <Button
        disabled={
          !selectedStatus || selectedStatus === order?.status || isSubmitting
        }
        onPress={handleSubmit}
        className="flex-1"
      >
        <Text className="text-white font-semibold">
          {isSubmitting ? t("common.updating") : t("common.update")}
        </Text>
      </Button>
    </View>
  );

  return (
    <>
      {renderTrigger()}

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={handleClose}
        title={t("common.update")}
        snapPoints={["80%"]}
        footer={renderFooter()}
      >
        {renderContent()}
      </ResponsiveModal>
    </>
  );
}

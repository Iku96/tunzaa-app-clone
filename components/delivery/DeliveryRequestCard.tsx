import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Phone as PhoneIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";

// Delivery truck icon between From → To
const DeliveryRouteIcon = () => (
  <View className="items-center justify-center px-2">
    <View className="flex-row items-center">
      <View className="w-2 h-2 rounded-full bg-muted-foreground" />
      <View className="w-6 h-[1.5px] bg-muted-foreground" />
      <Text className="text-muted-foreground text-xs mx-1">🚚</Text>
      <View className="w-6 h-[1.5px] bg-muted-foreground" />
      <View className="w-2 h-2 rounded-full bg-muted-foreground" />
    </View>
  </View>
);

interface DeliveryRequestCardProps {
  customerName: string;
  amount: number;
  currency?: string;
  fromLocation: string;
  toLocation: string;
  onAccept: () => void;
  onReject: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export const DeliveryRequestCard: React.FC<DeliveryRequestCardProps> = ({
  customerName,
  amount,
  currency = "Tshs",
  fromLocation,
  toLocation,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}) => {
  const { t } = useI18n();

  return (
    <View className="bg-background rounded-2xl border border-border p-4 mb-4">
      {/* Top Row: Avatar + Name + Price */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          {/* Avatar Circle */}
          <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3">
            <Text className="text-base font-semibold text-muted-foreground">
              {customerName?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted-foreground">Deliver to</Text>
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
              {customerName}
            </Text>
          </View>
        </View>
        <Text className="text-base font-bold" style={{ color: "#425BA4" }}>
          {currency} {amount?.toLocaleString()}
        </Text>
      </View>

      {/* From → To Row */}
      <View className="flex-row items-center justify-between mb-5 px-1">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-0.5">From</Text>
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            {fromLocation}
          </Text>
        </View>
        <DeliveryRouteIcon />
        <View className="flex-1 items-end">
          <Text className="text-xs text-muted-foreground mb-0.5">To</Text>
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            {toLocation}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 py-3 rounded-xl border border-border items-center justify-center"
          onPress={onReject}
          disabled={isRejecting || isAccepting}
          style={{ opacity: isRejecting ? 0.6 : 1 }}
        >
          <Text className="text-sm font-semibold text-foreground">
            {isRejecting ? "Rejecting..." : "Reject"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3 rounded-xl items-center justify-center"
          style={{ backgroundColor: "#425BA4", opacity: isAccepting ? 0.6 : 1 }}
          onPress={onAccept}
          disabled={isAccepting || isRejecting}
        >
          <Text className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
            {isAccepting ? "Accepting..." : "Accept"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

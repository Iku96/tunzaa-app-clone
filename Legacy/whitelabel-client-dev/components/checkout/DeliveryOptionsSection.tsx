import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Truck, Clock } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import type { DeliveryType } from "@/services/types/delivery";

interface DeliveryOptionsSectionProps {
  availableDeliveryTypes: DeliveryType[];
  selectedDeliveryType: string;
  onDeliveryTypeSelect: (deliveryType: string) => void;
}

export const DeliveryOptionsSection: React.FC<DeliveryOptionsSectionProps> = ({
  availableDeliveryTypes,
  selectedDeliveryType,
  onDeliveryTypeSelect,
}) => {
  const resolvedColors = useResolvedThemeColors();

  return (
    <View className="p-4 border-t border-border">
      {availableDeliveryTypes.map((option) => {
        const isSelected = selectedDeliveryType === option.id;
        return resolvedColors && isSelected ? (
          <TouchableOpacity
            key={option.id}
            className="flex-row items-center mb-3 p-3 rounded-xl"
            style={{
              backgroundColor: resolvedColors.successWithOpacity(0.1),
              borderColor: resolvedColors.success,
              borderWidth: 1,
            }}
            onPress={() => onDeliveryTypeSelect(option.id)}
          >
            <View className="w-12 h-12 rounded-full bg-success/10 items-center justify-center">
              <Truck size={24} className="text-success" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-foreground mb-1">
                {option.name}
              </Text>
              <View className="flex-row items-center gap-1">
                <Clock size={16} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  {option.description}
                </Text>
              </View>
            </View>
            <Text className="text-base font-semibold text-foreground">
              TShs {option.price.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={option.id}
            className={`flex-row items-center mb-3 p-3 rounded-xl ${
              isSelected
                ? "bg-green-500/10 border border-green-500"
                : "bg-muted"
            }`}
            onPress={() => onDeliveryTypeSelect(option.id)}
          >
            <View className="w-12 h-12 rounded-full bg-success/10 items-center justify-center">
              <Truck size={24} className="text-success" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-foreground mb-1">
                {option.name}
              </Text>
              <View className="flex-row items-center gap-1">
                <Clock size={16} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  {option.description}
                </Text>
              </View>
            </View>
            <Text className="text-base font-semibold text-foreground">
              TShs {option.price.toLocaleString()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

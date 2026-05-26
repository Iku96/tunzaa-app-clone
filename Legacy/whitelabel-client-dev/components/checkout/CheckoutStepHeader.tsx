import React from "react";
import { View } from "react-native";
import { Check } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";

export enum CheckoutStep {
  ORDER_OVERVIEW = "order_overview",
  DELIVERY_ADDRESS = "delivery_address",
  DELIVERY_OPTIONS = "delivery_options",
  DELIVERY_DETAILS = "delivery_details",
  PAYMENT_METHOD = "payment_method",
  ORDER_SUMMARY = "order_summary",
}

interface CheckoutStepHeaderProps {
  step: CheckoutStep;
  title: string;
  icon: React.ComponentType<any>;
  activeStep: CheckoutStep;
  isCompleted: boolean;
  onPress: (step: CheckoutStep) => void;
  disabled?: boolean;
}

export const CheckoutStepHeader: React.FC<CheckoutStepHeaderProps> = ({
  step,
  title,
  icon: Icon,
  activeStep,
  isCompleted,
  onPress,
  disabled = false,
}) => {
  const { t } = useI18n();
  return (
    <View className={`flex-row items-center justify-between p-4 ${
      disabled ? 'bg-muted/20' : 'bg-muted/30'
    }`}>
      <View className="flex-row items-center">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
            isCompleted 
              ? "bg-green-500" 
              : disabled 
                ? "bg-muted-foreground/30" 
                : "bg-secondary"
          }`}
        >
          {isCompleted ? (
            <Check size={16} className="text-white" />
          ) : (
            <Icon
              size={16}
              className={disabled ? "text-muted-foreground/50" : "text-white"}
            />
          )}
        </View>
        <Text
          className={`text-base font-semibold ${
            disabled ? "text-muted-foreground/50" : "text-foreground"
          }`}
        >
          {title}
        </Text>
      </View>
      {disabled && (
        <View className="flex-row items-center">
          <Text className="text-xs text-muted-foreground/50">
            {t("common.locked")}
          </Text>
        </View>
      )}
    </View>
  );
};

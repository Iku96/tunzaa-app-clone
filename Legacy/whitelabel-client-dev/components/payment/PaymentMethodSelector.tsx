import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";
import { QRCodeIcon, CashOnDeliveryIcon } from "@/components/icons/payment";
import type { PaymentMethod } from "@/config/payment-methods";

// Helper component to render payment icons
const PaymentIcon: React.FC<{
  image: any;
  width?: number;
  height?: number;
}> = ({ image, width = 60, height = 60 }) => {
  // Handle SVG components by string identifier
  if (typeof image === "string") {
    switch (image) {
      case "qr_code":
        return <QRCodeIcon width={width} height={height} />;
      case "cash_on_delivery":
        return <CashOnDeliveryIcon width={width} height={height} />;
      default:
        return null;
    }
  }

  // Handle regular images
  return (
    <Image source={image} style={{ width, height }} resizeMode="contain" />
  );
};

interface PaymentMethodSelectorProps {
  availableMethods: PaymentMethod[];
  selectedMethodId: string;
  onMethodSelect: (methodId: string) => void;
  title?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  availableMethods,
  selectedMethodId,
  onMethodSelect,
  title = "Select Payment Method",
}) => {
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  
  // Helper function to get method name with translation support
  const getMethodName = (method: PaymentMethod) => {
    if (method.nameKey) {
      return t(method.nameKey);
    }
    return method.name;
  };

  if (availableMethods.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <View className="p-4">
        <Text className="text-lg font-semibold mb-4">{title}</Text>
        <View className="flex-row flex-wrap gap-3 justify-center">
          {availableMethods.map((method) => {
            const isSelected = selectedMethodId === method.id;
            return resolvedColors && isSelected ? (
              <TouchableOpacity
                key={method.id}
                className="p-3 rounded-xl items-center justify-center min-w-[100px]"
                style={{
                  backgroundColor: resolvedColors.primaryWithOpacity(0.1),
                  borderColor: resolvedColors.primary,
                  borderWidth: 2,
                }}
                onPress={() => onMethodSelect(method.id)}
                activeOpacity={0.8}
              >
                <View style={{ marginBottom: 8 }}>
                  <PaymentIcon image={method.image} width={60} height={60} />
                </View>
                <Text className="text-sm font-semibold text-foreground text-center">
                  {getMethodName(method)}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={method.id}
                className={`p-3 rounded-xl items-center justify-center min-w-[100px] ${
                  isSelected
                    ? "bg-theme-primary/10 border-2 border-theme-primary"
                    : "bg-muted border-2 border-transparent"
                }`}
                onPress={() => onMethodSelect(method.id)}
                activeOpacity={0.8}
              >
                <View style={{ marginBottom: 8 }}>
                  <PaymentIcon image={method.image} width={60} height={60} />
                </View>
                <Text className="text-sm font-semibold text-muted-foreground text-center">
                  {getMethodName(method)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";
import { QRCodeIcon, CashOnDeliveryIcon } from "@/components/icons/payment";

interface PaymentMethod {
  id: string;
  image: any;
  name: string;
  nameKey?: string;
}

interface PaymentCategory {
  id: string;
  name: string;
  nameKey?: string;
  image: any;
  methods?: PaymentMethod[];
}

// Helper component to render payment icons
const PaymentIcon: React.FC<{
  image: any;
  width?: number;
  height?: number;
}> = ({ image, width = 48, height = 48 }) => {
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

interface PaymentMethodSectionProps {
  paymentMethods: PaymentCategory[];
  selectedPaymentCategory: string;
  selectedPaymentMethod: string;
  onPaymentCategorySelect: (categoryId: string) => void;
  // onPaymentMethodSelect: (methodId: string) => void;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentMethods,
  selectedPaymentCategory,
  selectedPaymentMethod,
  onPaymentCategorySelect,
  // onPaymentMethodSelect,
}) => {
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();

  return (
    <View className="p-4 border-t border-border">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-3 mb-4"
      >
        {paymentMethods.map((category) => {
          const isSelected = selectedPaymentCategory === category.id;
          return resolvedColors && isSelected ? (
            <TouchableOpacity
              key={category.id}
              className="mr-3 p-3 rounded-xl items-center justify-center w-32 h-32"
              style={{
                backgroundColor: resolvedColors.successWithOpacity(0.1),
                borderColor: resolvedColors.success,
                borderWidth: 1,
              }}
              onPress={() => onPaymentCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <View style={{ marginBottom: 8 }}>
                <PaymentIcon image={category.image} width={48} height={48} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">
                {category.nameKey ? t(category.nameKey) : category.name}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={category.id}
              className={`mr-3 p-3 rounded-xl items-center justify-center w-32 h-32 ${
                isSelected
                  ? "bg-green-500/10 border border-green-500"
                  : "bg-muted"
              }`}
              onPress={() => onPaymentCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <View style={{ marginBottom: 8 }}>
                <PaymentIcon image={category.image} width={48} height={48} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">
                {category.nameKey ? t(category.nameKey) : category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Show methods for selected category */}
      {/* {(() => {
        const selectedCategory = paymentMethods.find(
          (cat) => cat.id === selectedPaymentCategory
        );
        if (selectedCategory && selectedCategory.methods) {
          return (
            <View className="flex-row flex-wrap gap-2 justify-center mb-2">
              {selectedCategory.methods.map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return resolvedColors && isSelected ? (
                  <TouchableOpacity
                    key={method.id + method.name}
                    className="p-2 rounded mb-1 min-w-[80px] items-center justify-center"
                    style={{
                      backgroundColor: resolvedColors.successWithOpacity(0.1),
                      borderColor: resolvedColors.success,
                      borderWidth: 1,
                    }}
                    onPress={() => onPaymentMethodSelect(method.id)}
                  >
                    <View style={{ marginBottom: 8 }}>
                      <PaymentIcon
                        image={method.image}
                        width={60}
                        height={60}
                      />
                    </View>
                    <Text className="text-sm text-center">{method.name}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={method.id + method.name}
                    className={`p-2 rounded mb-1 min-w-[80px] items-center justify-center ${
                      isSelected
                        ? "bg-green-500/10 border border-green-500"
                        : "bg-muted"
                    }`}
                    onPress={() => onPaymentMethodSelect(method.id)}
                  >
                    <View style={{ marginBottom: 8 }}>
                      <PaymentIcon
                        image={method.image}
                        width={60}
                        height={60}
                      />
                    </View>
                    <Text className="text-sm text-center">{method.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }
        return null;
      })()} */}
    </View>
  );
};

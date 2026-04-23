import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { MapPin, Truck, CreditCard, Check } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { QRCodeIcon, CashOnDeliveryIcon } from "@/components/icons/payment";
import { useI18n } from "@/hooks/useI18n";
import type { DeliveryType } from "@/services/types/delivery";

interface DeliveryAddress {
  address_id?: string;
  title: string;
  address_line1: string;
  city: string;
}

interface PaymentCategory {
  id: string;
  name: string;
  nameKey?: string;
  image: any;
}

interface CartTotals {
  subtotal?: number;
  total: number;
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

interface OrderSummarySectionProps {
  buyerProfile?: {
    delivery_address: DeliveryAddress[];
  };
  selectedAddressId: string;
  availableDeliveryTypes: DeliveryType[];
  selectedDeliveryType: string;
  paymentMethods: PaymentCategory[];
  selectedPaymentCategory: string;
  cartTotals: CartTotals | undefined;
  totalItemCount: number;
  onPlaceOrder: () => void;
  onPaymentCategorySelect: (categoryId: string) => void;
  disabled?: boolean;
  showContinueButton?: boolean;
  isPaymentsEnabled?: boolean;
  isDeliveryEnabled?: boolean;
}

export const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  buyerProfile,
  selectedAddressId,
  availableDeliveryTypes,
  selectedDeliveryType,
  paymentMethods,
  selectedPaymentCategory,
  cartTotals,
  totalItemCount,
  onPlaceOrder,
  onPaymentCategorySelect,
  disabled = false,
  showContinueButton = true,
  isPaymentsEnabled = true,
  isDeliveryEnabled = true,
}) => {
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();

  // Get the selected delivery type object
  const selectedDelivery = availableDeliveryTypes.find(
    (dt) => dt.id === selectedDeliveryType
  );
  const deliveryPrice = selectedDelivery?.price || 0;

  return (
    <View className="p-4 border-t border-border">
      {/* Summary of selections - only show delivery if enabled */}
      {isDeliveryEnabled && (
      <View className="mb-4 space-y-3">
        <View className="flex-row items-center">
          <MapPin size={16} className="text-muted-foreground mr-2" />
          <Text className="text-sm text-muted-foreground flex-1 ml-2">
            {
              buyerProfile?.delivery_address.find(
                (addr) => addr.address_id === selectedAddressId
              )?.title
            }
          </Text>
        </View>
        <View className="flex-row items-center">
          <Truck size={16} className="text-muted-foreground mr-2" />
          <Text className="text-sm text-muted-foreground flex-1 ml-2">
            {
              availableDeliveryTypes.find(
                (dt) => dt.id === selectedDeliveryType
              )?.name
            }
          </Text>
        </View>
      </View>
      )}

      {/* Payment Method Selection - only show if payments enabled */}
      {isPaymentsEnabled && (
      <View className="mb-4">
        <View className="flex-row items-center mb-3">
          <CreditCard size={16} className="text-muted-foreground mr-2" />
          <Text className="text-sm font-semibold text-foreground ml-2">
            {t("payment.payment_method")}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {paymentMethods.map((category) => {
            const isSelected = selectedPaymentCategory === category.id;
            return (
              <Button
                size="sm"
                key={category.id}
                variant={isSelected ? "primary" : "outline"}
                className={`flex-1 min-w-[120px] h-16 justify-center items-center relative`}
                onPress={() => !disabled && onPaymentCategorySelect(category.id)}
                disabled={disabled}
                style={
                  isSelected && resolvedColors
                    ? {
                        backgroundColor: resolvedColors.successWithOpacity(0.1),
                        borderColor: resolvedColors.success,
                        borderWidth: 2,
                      }
                    : {}
                }
              >
                <View className="items-center">
                  {/* Radio button indicator */}
                  <View 
                    className={`w-4 h-4 rounded-full border-2 mt-2 items-center justify-center ${
                      isSelected ? 'border-success' : 'border-muted-foreground'
                    }`}
                    style={
                      isSelected && resolvedColors
                        ? { 
                            borderColor: resolvedColors.success,
                            backgroundColor: resolvedColors.success 
                          }
                        : {}
                    }
                  >
                    {isSelected && (
                      <View 
                        className="w-2 h-2 rounded-full bg-white"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    )}
                  </View>
                  {/* <PaymentIcon image={category.image} width={24} height={24} /> */}
                  <Text 
                    className="text-xs font-semibold text-center mt-1 mb-2"
                    style={
                      isSelected && resolvedColors
                        ? { color: resolvedColors.success }
                        : {}
                    }
                  >
                    {category.nameKey ? t(category.nameKey) : category.name}
                  </Text>
                  
                  
                </View>
              </Button>
            );
          })}
        </View>
        
        {/* Helper text */}
        {!disabled && (
          <Text className="text-xs text-muted-foreground mt-2 text-center">
            {t("payment.please_select_payment_method")}
          </Text>
        )}
      </View>
      )}

      <View className="border-t border-border pt-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-muted-foreground">
            {t("payment.subtotal")} ({totalItemCount} {t("orders.items")})
          </Text>
          <Text className="text-sm font-semibold text-foreground">
            TShs{" "}
            {(cartTotals?.subtotal || cartTotals?.total || 0).toLocaleString()}
          </Text>
        </View>
        {/* Delivery fee - only show if delivery enabled */}
        {isDeliveryEnabled && (
        <View className="flex-row justify-between mb-4">
          <Text className="text-sm text-muted-foreground">{t("payment.delivery_fee")}</Text>
          <Text className="text-sm font-semibold text-foreground">
            TShs{" "}
            {deliveryPrice.toLocaleString()}
          </Text>
        </View>
        )}
        <View className="flex-row justify-between pt-4 border-t border-border mb-4">
          <Text className="text-lg font-bold text-foreground">{t("payment.total")}</Text>
          <Text className="text-lg font-bold text-success">
            TShs{" "}
            {(
              (cartTotals?.total || 0) +
              (isDeliveryEnabled ? deliveryPrice : 0)
            ).toLocaleString()}
          </Text>
        </View>

        {showContinueButton && (
        <Button
          variant="primary"
          onPress={onPlaceOrder}
          disabled={(isPaymentsEnabled && !selectedPaymentCategory) || disabled}
          className="w-full"
        >
          <Text className="text-sm font-semibold text-foreground text-center">
            {disabled
              ? t("payment.payment_method_selected")
              : isPaymentsEnabled && !selectedPaymentCategory
              ? t("payment.select_payment_method")
              : isPaymentsEnabled
              ? t("payment.continue_to_payment")
              : t("payment.place_order")}
          </Text>
        </Button>
        )}
      </View>
    </View>
  );
};

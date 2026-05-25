import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MapPin, Plus } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface DeliveryAddress {
  address_id?: string;
  title: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

interface BuyerProfile {
  delivery_address: DeliveryAddress[];
  default_delivery_address?: string;
}

interface DeliveryAddressSectionProps {
  buyerProfile: BuyerProfile | undefined;
  selectedAddressId: string;
  profileLoading: boolean;
  onAddressSelect: (addressId: string) => void;
  onAddNewAddress: () => void;
}

export const DeliveryAddressSection: React.FC<DeliveryAddressSectionProps> = ({
  buyerProfile,
  selectedAddressId,
  profileLoading,
  onAddressSelect,
  onAddNewAddress,
}) => {
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();

  return (
    <View className="p-4 border-t border-border">
      {profileLoading ? (
        <Text className="text-muted-foreground">{t("common.loading")}</Text>
      ) : (
        <>
          {buyerProfile?.delivery_address?.map((address) => {
            const isSelected = selectedAddressId === address.address_id;
            return resolvedColors && isSelected ? (
              <TouchableOpacity
                key={address.address_id}
                className="mb-3 rounded-xl p-4"
                style={{
                  backgroundColor: resolvedColors.successWithOpacity(0.1),
                  borderColor: resolvedColors.success,
                  borderWidth: 1,
                }}
                onPress={() => onAddressSelect(address.address_id!)}
              >
                <View className="flex-row items-center mb-2 gap-2">
                  <MapPin size={20} className="text-muted-foreground" />
                  <Text className="flex-1 text-base font-semibold text-foreground">
                    {address.title}
                  </Text>
                  {address.address_id ===
                    buyerProfile?.default_delivery_address && (
                    <Badge variant="secondary" className="bg-yellow-200">
                      <Text className="text-xs text-accent">{t("common.default")}</Text>
                    </Badge>
                  )}
                </View>
                <Text className="text-sm text-muted-foreground ml-7">
                  {address.address_line1}, {address.city}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={address.address_id}
                className={`mb-3 rounded-xl p-4 ${
                  isSelected
                    ? "bg-green-500/10 border border-green-500"
                    : "bg-muted"
                }`}
                onPress={() => onAddressSelect(address.address_id!)}
              >
                <View className="flex-row items-center mb-2 gap-2">
                  <MapPin size={20} className="text-muted-foreground" />
                  <Text className="flex-1 text-base font-semibold text-foreground">
                    {address.title}
                  </Text>
                  {address.address_id ===
                    buyerProfile?.default_delivery_address && (
                    <Badge variant="secondary" className="bg-yellow-200">
                      <Text className="text-xs text-accent">{t("common.default")}</Text>
                    </Badge>
                  )}
                </View>
                <Text className="text-sm text-muted-foreground ml-7">
                  {address.address_line1}, {address.city}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            className="flex-row items-center justify-center p-4 bg-muted rounded-xl gap-2"
            onPress={onAddNewAddress}
          >
            <Plus size={20} className="text-success" />
            <Text className="text-sm font-semibold text-success">
              {t("payment.add_address")}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

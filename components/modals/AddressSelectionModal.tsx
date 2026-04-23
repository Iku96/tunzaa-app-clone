import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { MapPin, Plus, Star } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeliveryAddress } from "@/services/types/buyers";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface AddressSelectionModalProps {
  isOpen: boolean;
  addresses: DeliveryAddress[];
  currentLocation: string;
  defaultAddressId?: string;
  isLoading: boolean;
  onClose: () => void;
  onAddressSelect: (address: DeliveryAddress) => void;
  onAddNewAddress: () => void;
}

export function AddressSelectionModal({
  isOpen,
  addresses,
  currentLocation,
  defaultAddressId,
  isLoading,
  onClose,
  onAddressSelect,
  onAddNewAddress,
}: AddressSelectionModalProps) {
  const resolvedColors = useResolvedThemeColors();
  const renderContent = () => (
    <View className="flex-1">
      <Text className="text-sm text-muted-foreground mb-4">
        Select a delivery address or add a new one
      </Text>

      {isLoading ? (
        <View className="py-8 items-center">
          <Text className="text-muted-foreground">Loading addresses...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Existing Addresses */}
          {addresses.map((address) => {
            const isDefault = address.address_id === defaultAddressId;
            const isCurrent = currentLocation.includes(address.address_line1);

            return (
              <TouchableOpacity
                key={address.address_id}
                className={cn(
                  "mb-3 rounded-xl p-4 border",
                  isCurrent
                    ? "bg-primary/5 border-primary"
                    : "bg-muted border-border"
                )}
                onPress={() => onAddressSelect(address)}
              >
                <View className="flex-row items-start gap-3">
                  <View className="mt-1">
                    <MapPin
                      size={20}
                      className={cn(
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                      color={resolvedColors.foreground}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text
                        className={cn(
                          "text-base font-semibold",
                          isCurrent ? "text-primary" : "text-foreground"
                        )}
                      >
                        {address.title}
                      </Text>
                      {isDefault && (
                        <Badge variant="secondary" className="bg-yellow-100">
                          <View className="flex-row items-center gap-1">
                            <Star
                              size={10}
                              className="text-yellow-600"
                              fill="currentColor"
                              color={resolvedColors.foreground}
                            />
                            <Text className="text-xs text-primary">
                              Default
                            </Text>
                          </View>
                        </Badge>
                      )}
                    </View>

                    <Text className="text-sm text-muted-foreground mb-1">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </Text>

                    <Text className="text-sm text-muted-foreground">
                      {address.city}, {address.country}
                    </Text>

                    {address.land_mark && (
                      <Text className="text-xs text-muted-foreground mt-1">
                        Near: {address.land_mark}
                      </Text>
                    )}
                  </View>

                  {isCurrent && (
                    <View className="mt-1">
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add New Address Option */}
          <TouchableOpacity
            className="mt-2 mb-4 rounded-xl p-4 border-2 border-dashed border-muted-foreground/30 bg-muted/50"
            onPress={onAddNewAddress}
          >
            <View className="flex-row items-center justify-center gap-3">
              <Plus size={24} className="text-primary/70" color={ resolvedColors?.primary || "#000000" } />
              <Text className="text-base font-semibold text-primary/70">
                Add New Address
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  const renderFooter = () => (
    <View className="flex-row gap-x-3">
      <Button variant="outline" onPress={onClose} className="flex-1">
        <Text className="font-semibold text-foreground">Cancel</Text>
      </Button>
    </View>
  );

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Select Delivery Address"
      snapPoints={["75%"]}
      footer={addresses.length > 0 ? renderFooter() : undefined}
    >
      {renderContent()}
    </ResponsiveModal>
  );
}

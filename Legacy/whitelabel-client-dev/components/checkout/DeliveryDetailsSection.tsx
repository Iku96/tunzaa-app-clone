import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface VehicleType {
  vehicle_id: string;
  name: string;
  description: string;
}

interface DeliveryPartner {
  partner_id: string;
  name: string;
  vehicle_info: {
    type: string;
  };
  location: {
    radiusKm: number;
  };
}

interface DeliveryDetailsSectionProps {
  selectedDeliveryType: string;
  selectedVehicle: string;
  selectedPartner: string;
  vehicleTypes?: { items: VehicleType[] };
  partners?: { items: DeliveryPartner[] };
  onVehicleSelect: (vehicleId: string) => void;
  onPartnerSelect: (partnerId: string) => void;
}

export const DeliveryDetailsSection: React.FC<DeliveryDetailsSectionProps> = ({
  selectedDeliveryType,
  selectedVehicle,
  selectedPartner,
  vehicleTypes,
  partners,
  onVehicleSelect,
  onPartnerSelect,
}) => {
  const resolvedColors = useResolvedThemeColors();

  return (
    <View className="p-4 border-t border-border">
      {/* Vehicle Type Selection for Standard Delivery */}
      {selectedDeliveryType === "standard" && (
        <>
          {vehicleTypes?.items.map((vehicle: VehicleType) => {
            const isSelected = selectedVehicle === vehicle.vehicle_id;
            return resolvedColors && isSelected ? (
              <TouchableOpacity
                key={vehicle.vehicle_id}
                className="mb-2 p-3 rounded-lg"
                style={{
                  backgroundColor: resolvedColors.successWithOpacity(0.1),
                  borderColor: resolvedColors.success,
                  borderWidth: 1,
                }}
                onPress={() => onVehicleSelect(vehicle.vehicle_id)}
              >
                <Text className="font-semibold">{vehicle.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  {vehicle.description}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={vehicle.vehicle_id}
                className={`mb-2 p-3 rounded-lg ${
                  isSelected
                    ? "bg-green-500/10 border border-green-500"
                    : "bg-muted"
                }`}
                onPress={() => onVehicleSelect(vehicle.vehicle_id)}
              >
                <Text className="font-semibold">{vehicle.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  {vehicle.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Partner Selection for Express Delivery */}
      {selectedDeliveryType === "express" && (
        <>
          {partners?.items.map((partner: DeliveryPartner) => {
            const isSelected = selectedPartner === partner.partner_id;
            return resolvedColors && isSelected ? (
              <TouchableOpacity
                key={partner.partner_id}
                className="mb-2 p-3 rounded-lg"
                style={{
                  backgroundColor: resolvedColors.successWithOpacity(0.1),
                  borderColor: resolvedColors.success,
                  borderWidth: 1,
                }}
                onPress={() => onPartnerSelect(partner.partner_id)}
              >
                <Text className="font-semibold">{partner.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  {partner.vehicle_info.type} - {partner.location.radiusKm}
                  km radius
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={partner.partner_id}
                className={`mb-2 p-3 rounded-lg ${
                  isSelected
                    ? "bg-green-500/10 border border-green-500"
                    : "bg-muted"
                }`}
                onPress={() => onPartnerSelect(partner.partner_id)}
              >
                <Text className="font-semibold">{partner.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  {partner.vehicle_info.type} - {partner.location.radiusKm}
                  km radius
                </Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </View>
  );
};

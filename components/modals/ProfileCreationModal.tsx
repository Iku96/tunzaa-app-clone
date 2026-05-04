import { useState } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import {
  AffiliateForm,
  type AffiliateFormData,
} from "@/components/forms/AffiliateForm";
import {
  DeliveryForm,
  type DeliveryFormData,
} from "@/components/forms/DeliveryForm";
import { useCreateDeliveryPartner } from "@/src/services/auth";
import { affiliatesApi } from "@/src/services/affiliates";
import { CreateAffiliateBody } from "@/src/services/types/affiliates";

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileType: "delivery" | "winga" | null;
}

export function ProfileCreationModal({
  isOpen,
  onClose,
  profileType,
}: ProfileCreationModalProps) {
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createDeliveryPartner = useCreateDeliveryPartner();

  const handleDeliverySubmit = async (data: DeliveryFormData) => {
    if (!user?.user_id) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare delivery partner data
      let deliveryData: any = {
        user_id: user.user_id,
        first_name: data.name.split(" ")[0] || "",
        last_name: data.name.split(" ").slice(1).join(" ") || "",
        email: data.email,
        partner_type: data.formType,
      };

      if (data.formType === "individual") {
        deliveryData = {
          ...deliveryData,
          profile_picture: data.profilePicture,
          vehicle_info: {
            vehicle_type_id: data.selectedVehicleId,
            details: data.vehicleDetails,
          },
          location: data.location
            ? {
                coordinates: {
                  lat: data.location.latitude,
                  lng: data.location.longitude,
                },
                radiusKm: data.radiusKm || 10,
              }
            : undefined,
          location_description: data.locationDescription,
        };
      } else if (data.formType === "business") {
        deliveryData = {
          ...deliveryData,
          name: data.businessName,
          business_logo: data.businessLogo,
          contact_details: data.contactDetails,
          drivers:
            data.drivers
              ?.filter((d) => d.name && d.phone && d.vehicleTypeId)
              .map((d) => ({
                name: d.name,
                phone: d.phone,
                vehicle_info: {
                  vehicle_type_id: d.vehicleTypeId,
                  details: d.vehicleDetails,
                },
                location: d.location
                  ? {
                      coordinates: {
                        lat: d.location.latitude,
                        lng: d.location.longitude,
                      },
                      radiusKm: d.radiusKm || 10,
                    }
                  : undefined,
                location_description: d.locationDescription,
              })) || [],
        };
      } else if (data.formType === "wakala") {
        deliveryData = {
          ...deliveryData,
          name: data.businessName,
          profile_picture: data.profilePicture,
          location: data.location
            ? {
                coordinates: {
                  lat: data.location.latitude,
                  lng: data.location.longitude,
                },
                radiusKm: data.radiusKm || 10,
              }
            : undefined,
          location_description: data.locationDescription,
          drivers: [],
        };
      }

      await createDeliveryPartner.mutateAsync({
        userId: user.user_id,
        data: deliveryData,
      });

      // Refresh user data to update profiles
      await refreshUserData();

      Alert.alert("Success", "Delivery partner profile created successfully!");
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create delivery partner profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAffiliateSubmit = async (data: AffiliateFormData) => {
    if (!user?.user_id) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setIsLoading(true);

    try {
      const affiliateData: CreateAffiliateBody = {
        user_id: user.user_id,
        name: data.name,
        email: data.email,
        phone: user.phone_number, // Use phone from user context
        bio: data.bio,
        website: "", // Default empty, can be updated later
        social_media: {
          instagram: data.instagram,
          twitter: data.twitter,
          facebook: data.facebook,
        },
      };

      await affiliatesApi.createAffiliate(affiliateData);

      // Refresh user data to update profiles
      await refreshUserData();

      Alert.alert("Success", "Affiliate profile created successfully!");
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create affiliate profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (profileType === "delivery") return "Create Delivery Partner Profile";
    if (profileType === "winga") return "Create Affiliate Partner Profile";
    return "Create Profile";
  };

  const renderForm = () => {
    if (profileType === "delivery") {
      return (
        <DeliveryForm onSubmit={handleDeliverySubmit} isLoading={isLoading} />
      );
    }

    if (profileType === "winga") {
      return (
        <AffiliateForm onSubmit={handleAffiliateSubmit} isLoading={isLoading} />
      );
    }

    return null;
  };

  if (!profileType) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={getTitle()}
      snapPoints={["90%"]}
      fitContent={false}
      enableScrolling={true}
    >
      <View className="flex-1 p-6">{renderForm()}</View>
    </ResponsiveModal>
  );
}

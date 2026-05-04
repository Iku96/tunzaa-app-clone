import { useState } from "react";
import { View, ScrollView } from "react-native";
import * as Burnt from "burnt";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Terminal } from "@/lib/icons/Terminal";
import { useUpdateUser, useUpdateVendor, useUpdateDeliveryPartner } from "@/src/services/auth";

export type UserRole = "buyer" | "vendor" | "delivery" | "winga" | "super";

interface KycDocument {
  documentType: string;
  documentNumber: string;
  documentLink: string;
}

interface Kyc {
  verified: boolean;
  documents: KycDocument[];
}

interface UserProfile {
  profile_id: string;
  role: UserRole;
  displayName: string;
  preferences?: {
    newsletterSubscribed: boolean;
    defaultPaymentMethod: string;
  };
  address?: {
    line1: string;
    city: string;
    country: string;
  };
  contactNumber?: string;
  availability?: boolean;
  storeDetails?: {
    storeName: string;
    storeAddress: string;
    registrationNumber: string;
  };
  settings?: {
    autoApproveOrders: boolean;
  };
  kyc: Kyc;
}

interface User {
  id: any;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  activeProfileRole: UserRole;
  profiles: UserProfile[];
  roles: { role: string; description: string }[];
  meta: {
    createdAt: string;
    updatedAt: string;
  };
  userType?: UserRole;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  is_verified: boolean;
  tenant_id: string;
  last_login: string | null;
  provider: string;
  firebase_uid: string | null;
  vendorDetails?: any;
  deliveryDetails?: any;
  affiliateDetails?: any;
}

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: User | null;
  onSuccess: () => void;
}

export function ProfileUpdateModal({
  isOpen,
  onClose,
  profile,
}: ProfileUpdateModalProps) {
  const updateUser = useUpdateUser();
  const updateVendor = useUpdateVendor();
  const updateDeliveryPartner = useUpdateDeliveryPartner();

  if (!profile) {
    return (
      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Update Profile"
        snapPoints={["90%"]}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-destructive">No profile data available</Text>
        </View>
      </ResponsiveModal>
    );
  }

  const activeRole = profile.activeProfileRole;
  const mainProfile = profile.profiles?.find(
    (p) => p.role === activeRole
  ) || { displayName: profile.name || "" };

  const [formData, setFormData] = useState({
    firstName: profile.deliveryDetails?.user_details?.first_name || mainProfile.displayName?.split(" ")[0] || "",
    lastName: profile.deliveryDetails?.user_details?.last_name || mainProfile.displayName?.split(" ")[1] || "",
    contactNumber: profile.phone_number || "",
    ...(activeRole === "vendor" && {
      businessName: profile.vendorDetails?.business_name || "",
      displayName: profile.vendorDetails?.display_name || "",
      contactEmail: profile.vendorDetails?.contact_email || "",
      contactPhone: profile.vendorDetails?.contact_phone || "",
    }),
    ...(activeRole === "delivery" && {
      partnerName: profile.deliveryDetails?.name || "",
      isAvailable: profile.deliveryDetails?.is_available || false,
      vehicleType: profile.deliveryDetails?.vehicle_info?.type || "",
      vehicleModel: profile.deliveryDetails?.vehicle_info?.model || "",
      vehiclePlate: profile.deliveryDetails?.vehicle_info?.plate_number || "",
    }),
  });

  const [error, setError] = useState<string | null>(null);
  const isLoading = updateUser.isPending || updateVendor.isPending || updateDeliveryPartner.isPending;

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      setError("First and last name are required");
      Burnt.toast({
        title: "Invalid input",
        preset: "error",
        message: "Please enter both first and last names",
        haptic: "error",
        duration: 3,
        from: "top",
      });
      return;
    }

    if (activeRole === "vendor") {
      if (!formData.businessName || !formData.displayName || !formData.contactEmail) {
        setError("Business name, display name, and contact email are required");
        Burnt.toast({
          title: "Invalid input",
          preset: "error",
          message: "Please fill in all required vendor fields",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        return;
      }
    }

    if (activeRole === "delivery") {
      if (!formData.partnerName) {
        setError("Partner name is required");
        Burnt.toast({
          title: "Invalid input",
          preset: "error",
          message: "Please enter your business/partner name",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        return;
      }
    }

    try {
      await updateUser.mutateAsync({
        userId: profile.id,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      });

      if (activeRole === "vendor" && profile.vendorDetails) {
        await updateVendor.mutateAsync({
          vendorId: profile.vendorDetails.vendor_id,
          data: {
            business_name: formData.businessName,
            display_name: formData.displayName,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
          },
        });
      } else if (activeRole === "delivery" && profile.deliveryDetails) {
        const updateData: any = {
          name: formData.partnerName,
          is_available: formData.isAvailable,
        };

        if (profile.deliveryDetails?.type !== "pickup_point" && formData.vehicleType) {
          updateData.vehicle_info = {
            type: formData.vehicleType,
            model: formData.vehicleModel,
            plate_number: formData.vehiclePlate,
          };
        }

        await updateDeliveryPartner.mutateAsync({
          partnerId: profile.deliveryDetails.partner_id,
          data: updateData,
        });
      }

      Burnt.toast({
        title: "Profile Updated",
        preset: "done",
        message: "Your profile has been successfully updated",
        haptic: "success",
        duration: 2,
        from: "top",
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
      Burnt.toast({
        title: "Update Failed",
        preset: "error",
        message: "Something went wrong while updating your profile",
        haptic: "error",
        duration: 3,
        from: "top",
      });
    }
  };

  const renderNameFields = () => (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-medium">
          First Name <Text className="text-destructive">*</Text>
        </Text>
        <Input
          value={formData.firstName}
          onChangeText={(value) => setFormData({ ...formData, firstName: value })}
          placeholder="Enter your first name"
          editable={!isLoading}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium">
          Last Name <Text className="text-destructive">*</Text>
        </Text>
        <Input
          value={formData.lastName}
          onChangeText={(value) => setFormData({ ...formData, lastName: value })}
          placeholder="Enter your last name"
          editable={!isLoading}
        />
      </View>
    </View>
  );

  const renderForm = () => {
    switch (activeRole) {
      case "buyer":
        return (
          <View className="gap-4">
            {renderNameFields()}
            <View className="gap-2">
              <Text className="text-sm font-medium">Contact Number</Text>
              <Input
                value={formData.contactNumber}
                onChangeText={(value) =>
                  setFormData({ ...formData, contactNumber: value })
                }
                placeholder="Enter your contact number"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>
        );

      case "vendor":
        return (
          <View className="gap-4">
            {renderNameFields()}

            <View className="gap-2">
              <Text className="text-sm font-medium">
                Business Name <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.businessName}
                onChangeText={(value) =>
                  setFormData({ ...formData, businessName: value })
                }
                placeholder="Enter your business name"
                editable={!isLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">
                Display Name <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.displayName}
                onChangeText={(value) =>
                  setFormData({ ...formData, displayName: value })
                }
                placeholder="Enter display name"
                editable={!isLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">
                Contact Email <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.contactEmail}
                onChangeText={(value) =>
                  setFormData({ ...formData, contactEmail: value })
                }
                placeholder="Enter contact email"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">Contact Phone</Text>
              <Input
                value={formData.contactPhone}
                onChangeText={(value) =>
                  setFormData({ ...formData, contactPhone: value })
                }
                placeholder="Enter contact phone"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>
        );

      case "delivery":
        return (
          <View className="gap-4">
            {renderNameFields()}

            <View className="gap-2">
              <Text className="text-sm font-medium">Contact Number</Text>
              <Input
                value={formData.contactNumber}
                onChangeText={(value) =>
                  setFormData({ ...formData, contactNumber: value })
                }
                placeholder="Enter your contact number"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium">
                Business/Partner Name <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.partnerName}
                onChangeText={(value) =>
                  setFormData({ ...formData, partnerName: value })
                }
                placeholder="Enter your business name"
                editable={!isLoading}
              />
            </View>

            {profile.deliveryDetails?.type !== "pickup_point" && (
              <>
                <View className="gap-2">
                  <Text className="text-sm font-medium">Vehicle Type</Text>
                  <Input
                    value={formData.vehicleType}
                    onChangeText={(value) =>
                      setFormData({ ...formData, vehicleType: value })
                    }
                    placeholder="e.g., Motorcycle, Car, Bicycle"
                    editable={!isLoading}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">Vehicle Model</Text>
                  <Input
                    value={formData.vehicleModel}
                    onChangeText={(value) =>
                      setFormData({ ...formData, vehicleModel: value })
                    }
                    placeholder="e.g., Honda CB150, Toyota Corolla"
                    editable={!isLoading}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">Vehicle Plate Number</Text>
                  <Input
                    value={formData.vehiclePlate}
                    onChangeText={(value) =>
                      setFormData({ ...formData, vehiclePlate: value })
                    }
                    placeholder="Enter vehicle plate number"
                    editable={!isLoading}
                  />
                </View>
              </>
            )}

            <View className="gap-2">
              <Text className="text-sm font-medium">Availability Status</Text>
              <Button
                variant={formData.isAvailable ? "default" : "outline"}
                onPress={() =>
                  setFormData({
                    ...formData,
                    isAvailable: !formData.isAvailable,
                  })
                }
                disabled={isLoading}
                className="w-full"
              >
                <Text
                  className={
                    formData.isAvailable
                      ? "text-white"
                      : "text-muted-foreground"
                  }
                >
                  {formData.isAvailable
                    ? "Available for Deliveries"
                    : "Not Available"}
                </Text>
              </Button>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return false;
    }

    if (activeRole === "vendor") {
      return (
        formData.businessName.trim() &&
        formData.displayName.trim() &&
        formData.contactEmail.trim()
      );
    }

    if (activeRole === "delivery") {
      return formData.partnerName.trim();
    }

    return true;
  };

  const renderContent = () => (
    <ScrollView className="flex-1">
      {error && (
        <Alert icon={Terminal} variant="destructive" className="mb-4">
          <Text className="text-destructive">{error}</Text>
        </Alert>
      )}
      {renderForm()}
    </ScrollView>
  );

  const renderFooter = () => (
    <View className="flex-row gap-x-3">
      <Button
        variant="secondary"
        onPress={onClose}
        disabled={isLoading}
        className="flex-1"
      >
        <Text className="font-semibold text-muted-foreground">Cancel</Text>
      </Button>

      <Button
      variant="primary"
        disabled={isLoading || !isFormValid()}
        onPress={handleSubmit}
        className="flex-1"
      >
        <Text className="text-white font-semibold">
          {isLoading ? "Updating..." : "Update Profile"}
        </Text>
      </Button>
    </View>
  );

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Update Profile"
      snapPoints={["90%"]}
      footer={renderFooter()}
    >
      {renderContent()}
    </ResponsiveModal>
  );
}
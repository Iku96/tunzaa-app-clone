import { useState } from "react";
import { useAuth } from "@/context/auth";
import { useGetBuyerProfile, useUpdateBuyerProfile } from "@/services/buyers";
import type { DeliveryAddress } from "@/services/types/buyers";

interface AddressSubmissionOptions {
  onSuccess?: (address: DeliveryAddress) => void;
  onError?: (error: string) => void;
  autoSelect?: boolean; // For checkout flow
}

export function useAddressManagement(options: AddressSubmissionOptions = {}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get buyer profile and update mutation
  const { data: buyerProfile, isLoading: profileLoading } = useGetBuyerProfile(
    user?.user_id ?? "",
    !!user?.user_id
  );
  const updateProfile = useUpdateBuyerProfile();

  const handleAddressSubmit = async (address: any) => {
    if (!user?.user_id) {
      const errorMsg = "User not authenticated";
      setError(errorMsg);
      options.onError?.(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create standardized address object
      const newAddress: DeliveryAddress = {
        address_id: address.address_id || `addr_${Date.now()}`,
        title: address.title,
        land_mark: address.land_mark || address.directions || "",
        address_line1: address.address_line1 || address.line1 || "",
        city: address.city,
        state_province: address.state_province || address.city,
        country: address.country || "Tanzania",
        lat: address.lat?.toString() || address.latitude?.toString(),
        lng: address.lng?.toString() || address.longitude?.toString(),
      };

      // Check if editing existing address or creating new
      const isEditing = address.address_id && buyerProfile?.delivery_address.some(
        (addr) => addr.address_id === address.address_id
      );

      let updatedAddresses: DeliveryAddress[];
      
      if (isEditing && buyerProfile) {
        // Update existing address
        updatedAddresses = buyerProfile.delivery_address.map((addr) =>
          addr.address_id === newAddress.address_id ? newAddress : addr
        );
      } else if (buyerProfile) {
        // Add new address
        updatedAddresses = [...buyerProfile.delivery_address, newAddress];
      } else {
        // First address for new profile
        updatedAddresses = [newAddress];
      }

      // Update or create buyer profile
      const updatedProfile = buyerProfile
        ? {
            ...buyerProfile,
            delivery_address: updatedAddresses,
            default_delivery_address: address.isDefault
              ? newAddress.address_id
              : buyerProfile.default_delivery_address,
          }
        : {
            user_id: user.user_id,
            tenant_id: user.tenant_id,
            contact_email: user.email,
            contact_phone: user.phone_number,
            delivery_address: updatedAddresses,
            default_delivery_address: newAddress.address_id,
          };

      await updateProfile.mutateAsync({
        userId: user.user_id,
        data: updatedProfile,
      });

      // Call success callback with the new address
      options.onSuccess?.(newAddress);
    } catch (error) {
      const errorMsg = "Failed to add address. Please try again.";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user?.user_id || !buyerProfile) {
      const errorMsg = "Unable to set default address";
      setError(errorMsg);
      options.onError?.(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedProfile = {
        ...buyerProfile,
        default_delivery_address: addressId,
      };

      await updateProfile.mutateAsync({
        userId: user.user_id,
        data: updatedProfile,
      });
    } catch (error) {
      const errorMsg = "Failed to set default address. Please try again.";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user?.user_id || !buyerProfile) {
      const errorMsg = "Unable to delete address";
      setError(errorMsg);
      options.onError?.(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedAddresses = buyerProfile.delivery_address.filter(
        (addr) => addr.address_id !== addressId
      );

      // If deleting the default address, set a new default
      let newDefaultAddress = buyerProfile.default_delivery_address;
      if (buyerProfile.default_delivery_address === addressId) {
        newDefaultAddress =
          updatedAddresses.length > 0
            ? updatedAddresses[0].address_id
            : undefined;
      }

      const updatedProfile = {
        ...buyerProfile,
        delivery_address: updatedAddresses,
        default_delivery_address: newDefaultAddress,
      };

      await updateProfile.mutateAsync({
        userId: user.user_id,
        data: updatedProfile,
      });
    } catch (error) {
      const errorMsg = "Failed to delete address. Please try again.";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    buyerProfile,
    profileLoading,
    isSubmitting,
    error,
    setError,
    handleAddressSubmit,
    handleSetDefaultAddress,
    handleDeleteAddress,
  };
}

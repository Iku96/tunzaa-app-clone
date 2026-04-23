import { useMemo } from "react";
import { useGetVendor } from "@/services/vendors";
import { useGetDeliveryPartner } from "@/services/delivery";
import { useGetAffiliate } from "@/services/affiliates";
import { useAuth } from "@/context/auth";

interface ProfileDetails {
  vendorDetails: any | null;
  deliveryDetails: any | null;
  affiliateDetails: any | null;
  isLoading: boolean;
  hasErrors: boolean;
  errors: {
    vendor?: string;
    delivery?: string;
    affiliate?: string;
  };
}

/**
 * Custom hook to fetch profile details for vendor, delivery partner, and affiliate roles
 * Uses existing React Query hooks which have built-in retry logic and caching
 * Falls back to context data if available, otherwise fetches fresh data
 */
export const useProfileDetails = (): ProfileDetails => {
  const { user, getVendorDetails, getDeliveryDetails, getAffiliateDetails } =
    useAuth();

  // Get profile IDs from user profiles
  const vendorProfile = user?.profiles?.find(
    (profile) => profile.role === "vendor"
  );
  const deliveryProfile = user?.profiles?.find(
    (profile) => profile.role === "delivery"
  );
  const affiliateProfile = user?.profiles?.find(
    (profile) => profile.role === "winga"
  );

  // Check if we already have details in context
  const contextVendorDetails = getVendorDetails();
  const contextDeliveryDetails = getDeliveryDetails();
  const contextAffiliateDetails = getAffiliateDetails();

  // Conditionally fetch vendor details
  const {
    data: vendorData,
    isLoading: isVendorLoading,
    error: vendorError,
  } = useGetVendor(
    vendorProfile?.profile_id || "",
    // Only fetch if we don't have context data and have a profile ID
    !contextVendorDetails && !!vendorProfile?.profile_id
  );

  // Conditionally fetch delivery partner details
  const {
    data: deliveryData,
    isLoading: isDeliveryLoading,
    error: deliveryError,
  } = useGetDeliveryPartner(
    deliveryProfile?.profile_id || "",
    // Only fetch if we don't have context data and have a profile ID
    !contextDeliveryDetails && !!deliveryProfile?.profile_id
  );

  // Conditionally fetch affiliate details (using user_id for now as per TODO)
  const {
    data: affiliateData,
    isLoading: isAffiliateLoading,
    error: affiliateError,
  } = useGetAffiliate(
    user?.user_id || "",
    // Only fetch if we don't have context data and have a user ID and affiliate profile
    !contextAffiliateDetails && !!user?.user_id && !!affiliateProfile
  );

  return useMemo(() => {
    const result: ProfileDetails = {
      // Prefer context data over fresh API data
      vendorDetails: contextVendorDetails || vendorData || null,
      deliveryDetails: contextDeliveryDetails || deliveryData || null,
      affiliateDetails: contextAffiliateDetails || affiliateData || null,
      isLoading: isVendorLoading || isDeliveryLoading || isAffiliateLoading,
      hasErrors: !!(vendorError || deliveryError || affiliateError),
      errors: {},
    };

    // Add specific error messages
    if (vendorError) {
      result.errors.vendor =
        vendorError instanceof Error
          ? vendorError.message
          : "Failed to fetch vendor details";
    }
    if (deliveryError) {
      result.errors.delivery =
        deliveryError instanceof Error
          ? deliveryError.message
          : "Failed to fetch delivery partner details";
    }
    if (affiliateError) {
      result.errors.affiliate =
        affiliateError instanceof Error
          ? affiliateError.message
          : "Failed to fetch affiliate details";
    }

    return result;
  }, [
    contextVendorDetails,
    contextDeliveryDetails,
    contextAffiliateDetails,
    vendorData,
    deliveryData,
    affiliateData,
    isVendorLoading,
    isDeliveryLoading,
    isAffiliateLoading,
    vendorError,
    deliveryError,
    affiliateError,
  ]);
};

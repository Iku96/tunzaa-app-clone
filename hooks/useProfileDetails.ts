import { useMemo } from "react";
import { useGetVendor } from "@/src/services/vendors";
import { usePartnerByUser } from "@/src/services/delivery";
import { useGetAffiliate } from "@/src/services/affiliates";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";

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
  const { user } = useTunzaaAuth();

  // Case-insensitive safely search profiles
  const findProfile = (role: string) => {
      const lowerRole = role.toLowerCase();
      return user?.profiles?.find(
        (p: any) => p.role?.toLowerCase() === lowerRole
      );
  };

  const vendorProfile = findProfile("vendor") || findProfile("merchant");
  const deliveryProfile = findProfile("delivery") || findProfile("driver");
  const affiliateProfile = findProfile("winga") || findProfile("affiliate");

  // Extract pre-loaded details from TunzaaAuthContext if they exist
  const contextVendorDetails = user?.vendorDetails || vendorProfile?.metadata;
  const contextDeliveryDetails = user?.deliveryDetails || deliveryProfile?.metadata;
  const contextAffiliateDetails = user?.affiliateDetails || affiliateProfile?.metadata;

  // Use canonical user ID extractor
  const activeUserId = user?.id || user?.user_id || "";

  // Conditionally fetch vendor details if not present
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
  } = usePartnerByUser(
    activeUserId,
    // Only fetch if we don't have context data and have a user ID
    !contextDeliveryDetails && !!activeUserId
  );

  // Conditionally fetch affiliate details
  const {
    data: affiliateData,
    isLoading: isAffiliateLoading,
    error: affiliateError,
  } = useGetAffiliate(
    activeUserId,
    // Only fetch if we don't have context data and have a user ID and affiliate profile
    !contextAffiliateDetails && !!activeUserId && !!affiliateProfile
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

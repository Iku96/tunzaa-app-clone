import { ProductImage } from "@/src/services/products";
import { API_CONFIG } from "@/src/services/config";

/**
 * Helper function to get image URL from either a string or ProductImage object
 * @param image - The image data which can be either a string URL or a ProductImage object
 * @returns The URL string for the image
 */
export const getImageUrl = (image: string | ProductImage): string => {
  if (typeof image === "string") return image;
  return image.url;
};

/**
 * Validates if a string is a valid HTTP(S) URL
 */
export const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Generates a consistent avatar URL with a fallback to ui-avatars.com
 * Handles relative paths by prepending the API base URL.
 */
export const getAvatarUrl = (url?: string, name: string = 'User'): string => {
  if (isValidUrl(url)) {
    return url as string;
  }
  
  // Handle relative paths from backend
  if (url && typeof url === 'string' && url.startsWith('/')) {
    const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
      ? API_CONFIG.BASE_URL.slice(0, -1) 
      : API_CONFIG.BASE_URL;
    return `${baseUrl}${url}`;
  }

  // Fallback to initials avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=425ba4`;
};

/**
 * Safely parses a value that may be a JSON string or already an object.
 */
const safeParse = (val: any): any => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return null;
};

/**
 * Extracts the branding logo_url from a store object,
 * handling the case where `branding` may be a JSON string.
 * Only returns valid remote URLs (http/https) — rejects stale file:// URIs
 * that may have been saved from ImagePicker cache during onboarding.
 */
const getStoreLogoUrl = (store: any): string | undefined => {
  if (!store) return undefined;
  const branding = safeParse(store.branding);
  const candidates = [branding?.logo_url, branding?.logoUrl, branding?.image_url];
  return candidates.find(url => isValidUrl(url));
};

/**
 * Exhaustively searches all possible locations for a vendor's logo URL.
 * Handles: VendorResponse (direct API), profile metadata (hydrated), 
 * vendorDetails from auth context, and profile-level branding.
 * 
 * @param sources Object containing all possible data sources
 * @returns The logo URL string, or undefined if not found
 */
export const getVendorLogoUrl = (sources: {
  vendorData?: any;     // Direct response from useGetVendor()
  metadata?: any;       // vendorProfile.metadata (may contain spread VendorResponse after hydration)
  branding?: any;       // vendorProfile.branding 
  vendorDetails?: any;  // user.vendorDetails from auth context
  localExtras?: any;    // Local AsyncStorage extras
}): string | undefined => {
  const { vendorData, metadata, branding, vendorDetails, localExtras } = sources;

  // 1. Direct vendor API response (most reliable, from useGetVendor)
  if (vendorData) {
    const fromStores = getStoreLogoUrl(vendorData.stores?.[0]) || getStoreLogoUrl(vendorData.store);
    if (fromStores) return fromStores;
  }

  // 2. Profile metadata (after hydration, contains spread VendorResponse)
  if (metadata) {
    const fromMetaStores = getStoreLogoUrl(metadata.stores?.[0]) || getStoreLogoUrl(metadata.store);
    if (fromMetaStores) return fromMetaStores;
    // Direct fields on metadata
    if (isValidUrl(metadata.logo_url)) return metadata.logo_url;
    if (isValidUrl(metadata.image_url)) return metadata.image_url;
    if (isValidUrl(metadata.logoUrl)) return metadata.logoUrl;
    if (isValidUrl(metadata.profile_picture)) return metadata.profile_picture;
  }

  // 3. Profile-level branding
  const parsedBranding = safeParse(branding);
  if (parsedBranding) {
    if (isValidUrl(parsedBranding.logo_url)) return parsedBranding.logo_url;
    if (isValidUrl(parsedBranding.logoUrl)) return parsedBranding.logoUrl;
    if (isValidUrl(parsedBranding.image_url)) return parsedBranding.image_url;
  }

  // 4. vendorDetails from auth context
  if (vendorDetails) {
    const fromDetailsStores = getStoreLogoUrl(vendorDetails.stores?.[0]) || getStoreLogoUrl(vendorDetails.store);
    if (fromDetailsStores) return fromDetailsStores;
    if (isValidUrl(vendorDetails.logo_url)) return vendorDetails.logo_url;
  }

  // 5. Local AsyncStorage extras (last resort cache)
  if (localExtras && isValidUrl(localExtras.logo_url)) return localExtras.logo_url;

  return undefined;
};

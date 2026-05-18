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
 * Safely strips presigned upload query params from Linode/S3 links
 * which cause 403 Forbidden crashes on subsequent HTTP GET requests.
 */
export const cleanseImageUrl = (url?: string): string | undefined => {
  if (!url || typeof url !== 'string') return undefined;
  let s = url.trim();
  const isPresigned = s.includes('linodeobjects.com') || 
                     s.includes('X-Amz-Signature') || 
                     s.includes('AWSAccessKeyId') || 
                     s.includes('PutObject');
                     
  if (isPresigned && s.includes('?')) {
    s = s.split('?')[0];
  }
  return s;
};

/**
 * Safely resolves any relative or absolute image URL to a fully-qualified URL.
 * If the input starts with '/' it prepends the API base URL.
 */
export const resolveAbsoluteUrl = (url?: string): string | undefined => {
  if (!url || typeof url !== 'string') return undefined;
  const cleaned = cleanseImageUrl(url);
  if (!cleaned) return undefined;
  
  if (isValidUrl(cleaned)) {
    return cleaned;
  }
  
  if (cleaned.startsWith('/')) {
    const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
      ? API_CONFIG.BASE_URL.slice(0, -1) 
      : API_CONFIG.BASE_URL;
    return `${baseUrl}${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Generates a consistent avatar URL with a fallback to ui-avatars.com
 * Handles relative paths by prepending the API base URL.
 */
export const getAvatarUrl = (url?: string, name: string = 'User'): string => {
  const resolved = resolveAbsoluteUrl(url);
  if (resolved) return resolved;

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
 * Supports absolute URLs and relative paths starting with '/'.
 */
const getStoreLogoUrl = (store: any): string | undefined => {
  if (!store) return undefined;
  const branding = safeParse(store.branding);
  const candidates = [branding?.logo_url, branding?.logoUrl, branding?.image_url];
  const found = candidates.find(url => url && typeof url === 'string' && (isValidUrl(url) || url.startsWith('/')));
  return found ? resolveAbsoluteUrl(found) : undefined;
};

/**
 * Exhaustively searches all possible locations for a vendor's logo URL.
 * Handles: VendorResponse (direct API), profile metadata (hydrated), 
 * vendorDetails from auth context, and profile-level branding.
 * Supports absolute and relative paths starting with '/'.
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
    const fromDirectStore = getStoreLogoUrl(vendorData);
    if (fromDirectStore) return fromDirectStore;
    
    const fromStores = getStoreLogoUrl(vendorData.stores?.[0]) || getStoreLogoUrl(vendorData.store);
    if (fromStores) return fromStores;
  }

  // 2. Profile metadata (after hydration, contains spread VendorResponse)
  if (metadata) {
    const fromMetaStores = getStoreLogoUrl(metadata.stores?.[0]) || getStoreLogoUrl(metadata.store);
    if (fromMetaStores) return fromMetaStores;
    
    // Direct fields on metadata
    const directMetaCandidates = [metadata.logo_url, metadata.image_url, metadata.logoUrl, metadata.profile_picture];
    const foundMeta = directMetaCandidates.find(url => url && typeof url === 'string' && (isValidUrl(url) || url.startsWith('/')));
    if (foundMeta) return resolveAbsoluteUrl(foundMeta);
  }

  // 3. Profile-level branding
  const parsedBranding = safeParse(branding);
  if (parsedBranding) {
    const brandingCandidates = [parsedBranding.logo_url, parsedBranding.logoUrl, parsedBranding.image_url];
    const foundBranding = brandingCandidates.find(url => url && typeof url === 'string' && (isValidUrl(url) || url.startsWith('/')));
    if (foundBranding) return resolveAbsoluteUrl(foundBranding);
  }

  // 4. vendorDetails from auth context
  if (vendorDetails) {
    const fromDetailsStores = getStoreLogoUrl(vendorDetails.stores?.[0]) || getStoreLogoUrl(vendorDetails.store);
    if (fromDetailsStores) return fromDetailsStores;
    
    const detailsCandidates = [vendorDetails.logo_url, vendorDetails.logoUrl, vendorDetails.image_url];
    const foundDetails = detailsCandidates.find(url => url && typeof url === 'string' && (isValidUrl(url) || url.startsWith('/')));
    if (foundDetails) return resolveAbsoluteUrl(foundDetails);
  }

  // 5. Local AsyncStorage extras (last resort cache)
  if (localExtras) {
    const foundLocal = [localExtras.logo_url, localExtras.logoUrl].find(url => url && typeof url === 'string' && (isValidUrl(url) || url.startsWith('/')));
    if (foundLocal) return resolveAbsoluteUrl(foundLocal);
  }

  return undefined;
};

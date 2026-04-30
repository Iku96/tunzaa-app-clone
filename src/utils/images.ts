import { ProductImage } from "@/services/products";
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

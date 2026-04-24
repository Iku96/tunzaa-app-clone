import { ProductImage } from "@/services/products";

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
 * Bug #17 fix: Helper function to resolve inconsistent logo/image key naming 
 * across the API (logo, avatar, shop_logo, etc.) for business profiles.
 * @param profile - The merchant/vendor profile object from API or cache
 * @param fallback - Optional fallback placeholder image
 * @returns The resolved URL string
 */
export const getBusinessLogo = (profile: any, fallback: string = ''): string => {
  if (!profile) return fallback;
  
  // Try to find the logo URL from various common backend keys
  const logoUrl = profile.logo || 
                 profile.avatar || 
                 profile.profile_picture || 
                 profile.shop_logo || 
                 profile.image_url;
                 
  return typeof logoUrl === 'string' && logoUrl.trim() !== '' ? logoUrl : fallback;
};

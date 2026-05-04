import { ProductImage } from "@/src/services/products";

/**
 * Helper function to get image URL from either a string or ProductImage object
 * @param image - The image data which can be either a string URL or a ProductImage object
 * @returns The URL string for the image
 */
export const getImageUrl = (image: string | ProductImage): string => {
  if (typeof image === "string") return image;
  return image.url;
};

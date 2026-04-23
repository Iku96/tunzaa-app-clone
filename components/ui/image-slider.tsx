import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  ViewStyle,
} from "react-native";
import { Image as ImageIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/utils/images";
import { ProductImage } from "@/services/products";

// Union type to handle both product service types
type ImageType =
  | string
  | ProductImage
  | {
      image_id?: string;
      url: string;
      alt_text?: string | null;
      is_primary?: boolean;
      display_order?: number;
    };

interface ImageSliderProps {
  images: ImageType[];
  height?: number;
  minHeight?: number;
  style?: ViewStyle;
  showIndicators?: boolean;
  fallbackText?: string;
  onImageChange?: (index: number) => void;
  currentIndex?: number; // Add controlled index prop
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  height,
  minHeight,
  style,
  showIndicators = true,
  fallbackText = "No image available",
  onImageChange,
  currentIndex,
}) => {
  const [internalImageIndex, setInternalImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Use controlled index if provided, otherwise use internal state
  const currentImageIndex = currentIndex !== undefined ? currentIndex : internalImageIndex;
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  // Validate and sanitize image URL for mobile compatibility
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Process all product images
  const processedImages =
    images?.map((image) => {
      const imageUrl = getImageUrl(image as string | ProductImage);
      return {
        original: image,
        url: imageUrl,
        isValid: isValidImageUrl(imageUrl),
      };
    }) || [];

  // Filter to only valid images
  const validImages = processedImages.filter((img) => img.isValid);

  // Handle programmatic scrolling when currentIndex changes
  useEffect(() => {
    if (currentIndex !== undefined && scrollViewRef.current && validImages.length > 0) {
      const scrollToX = currentIndex * getImageWidth();
      scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
    }
  }, [currentIndex, validImages.length]);

  // Current image for display
  const currentImage = validImages[currentImageIndex]?.url || null;

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    );
    setInternalImageIndex(slideIndex);
    onImageChange?.(slideIndex);
  };

  const containerHeight =
    height || (Platform.OS === "web" ? "auto" : screenHeight * 0.4);
  const containerMinHeight =
    minHeight || (Platform.OS === "web" ? 400 : screenHeight * 0.4);
  
  // For web, calculate proper image width based on container
  const getImageWidth = () => {
    if (Platform.OS === "web") {
      // On web, use a more reasonable width that works with containers
      return Math.min(screenWidth, 600); // Max 600px width for better display
    }
    return screenWidth;
  };

  return (
    <View
      style={[
        {
          height: containerHeight,
          minHeight: containerMinHeight,
        },
        style,
      ]}
    >
      {currentImage ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {validImages.map((imageData, index) => (
              <Image
                key={index}
                source={{ uri: imageData.url }}
                style={{
                  width: getImageWidth(),
                  height: containerHeight,
                  minHeight: containerMinHeight,
                }}
                resizeMode={Platform.OS === "web" ? "contain" : "cover"}
                onError={(error) => {
                  console.error("Image loading error:", error);
                }}
              />
            ))}
          </ScrollView>

          {/* Image Indicator Dots */}
          {showIndicators && validImages.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              <View className="flex-row gap-2 bg-black/50 px-3 py-2 rounded-full">
                {validImages.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className="w-full h-full bg-muted items-center justify-center">
          <ImageIcon size={48} className="text-muted-foreground mb-2" />
          <Text className="text-muted-foreground">{fallbackText}</Text>
        </View>
      )}
    </View>
  );
};

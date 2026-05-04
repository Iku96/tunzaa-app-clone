import React, { useState } from "react";
import { View, TouchableOpacity, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react-native";
import { Button } from "./button";
import { Text } from "./text";
import { cn } from "@/lib/utils";
import { useUploadFile } from "@/src/services/upload";
import { useI18n } from "@/hooks/useI18n";

export interface ProductImage {
  url: string;
  alt?: string;
  is_primary: boolean;
}

interface ImageUploaderProps {
  // Single image mode (existing)
  value?: string;
  onImageSelected?: (uploadedUrl: string) => void;
  onImageRemoved?: () => void;

  // Multiple images mode (new)
  multiple?: boolean;
  images?: ProductImage[];
  onImagesChanged?: (images: ProductImage[]) => void;
  maxImages?: number;

  placeholder?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  maxFileSize?: number; // in MB
}

export function ImageUploader({
  value,
  onImageSelected,
  onImageRemoved,
  multiple = false,
  images = [],
  onImagesChanged,
  maxImages = 5,
  placeholder,
  className,
  disabled = false,
  aspectRatio = [1, 1],
  quality = 0.8,
  allowsEditing = true,
  maxFileSize = 10, // 10MB default
}: ImageUploaderProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const uploadFile = useUploadFile();
  
  const defaultPlaceholder = placeholder || t("ui.image_uploader.upload_image");

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      try {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== "granted" || mediaStatus !== "granted") {
          Alert.alert(
            t("ui.file_uploader.permissions_required"),
            t("ui.file_uploader.permissions_message"),
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Open Settings", 
                onPress: () => {
                  if (Platform.OS === "ios") {
                    // On iOS, we can't directly open settings, but we can provide instructions
                    Alert.alert(
                      "Enable Permissions",
                      "Go to Settings > Privacy & Security > Camera/Photos and enable permissions for this app.",
                      [{ text: "OK" }]
                    );
                  }
                }
              }
            ]
          );
          return false;
        }
      } catch (error) {
        console.error("Error requesting permissions:", error);
        Alert.alert(
          "Permission Error",
          "Unable to request permissions. Please try again or check your device settings.",
          [{ text: "OK" }]
        );
        return false;
      }
    }
    return true;
  };

  const validateImageSize = (asset: ImagePicker.ImagePickerAsset) => {
    const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      Alert.alert(
        t("ui.file_uploader.file_too_large"),
        t("ui.file_uploader.file_size_exceeded", { size: fileSizeInMB.toFixed(1), limit: maxFileSize }),
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const handleImageUpload = async (uri: string, filename?: string) => {
    try {
      setIsLoading(true);

      // Generate filename if not provided
      const finalFilename = filename || `image_${Date.now()}.jpg`;

      const result = await uploadFile.mutateAsync({
        uri,
        filename: finalFilename,
      });
      const uploadedUrl = result.fileCDNUrl || result.url;

      if (multiple && onImagesChanged) {
        // Multiple images mode
        const newImage: ProductImage = {
          url: uploadedUrl,
          alt: "",
          is_primary: images.length === 0, // First image is primary
        };
        const updatedImages = [...images, newImage];
        onImagesChanged(updatedImages);
      } else if (onImageSelected) {
        // Single image mode
        onImageSelected(uploadedUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert(
        t("ui.file_uploader.upload_failed"),
        t("ui.file_uploader.upload_failed_message"),
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePicker = async () => {
    if (disabled || isLoading) return;

    // Check if we've reached the max images limit in multiple mode
    if (multiple && images.length >= maxImages) {
      Alert.alert(
        "Maximum Images Reached",
        `You can only upload up to ${maxImages} images.`,
        [{ text: "OK" }]
      );
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    // Web-optimized selection flow
    if (Platform.OS === "web") {
      // On web, prefer gallery selection as camera access requires specific user interaction
      pickImageFromGallery();
    } else {
      // On native, show both options
      Alert.alert("Select Image", "Choose how you want to select an image", [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: () => pickImageFromCamera() },
        { text: "Gallery", onPress: () => pickImageFromGallery() },
      ]);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Web camera requires immediate user interaction
      if (Platform.OS === "web") {
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect: aspectRatio,
        quality,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (validateImageSize(asset)) {
          const filename = asset.fileName || `camera_${Date.now()}.jpg`;
          await handleImageUpload(asset.uri, filename);
        }
      }
    } catch (error) {
      console.error("Error picking image from camera:", error);

      // More specific error handling for web
      if (Platform.OS === "web") {
        Alert.alert(
          "Camera Error",
          "Unable to access camera. Please ensure camera permissions are granted in your browser settings.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to take photo. Please try again.");
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        quality,
        exif: false,
      };

      // Add aspect ratio for native platforms
      if (Platform.OS !== "web") {
        pickerOptions.aspect = aspectRatio;
      }

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (validateImageSize(asset)) {
          const filename = asset.fileName || `gallery_${Date.now()}.jpg`;
          await handleImageUpload(asset.uri, filename);
        }
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);

      // Web-specific error messaging
      if (Platform.OS === "web") {
        Alert.alert(
          "Upload Error",
          "Unable to select image. Please try again or ensure your browser supports file uploads.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to select image. Please try again.");
      }
    }
  };

  const handleRemoveImage = (imageUrl?: string) => {
    if (disabled) return;

    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          if (multiple && onImagesChanged && imageUrl) {
            // Multiple images mode - remove specific image
            const updatedImages = images.filter((img) => img.url !== imageUrl);
            // If we removed the primary image, make the first remaining image primary
            if (
              updatedImages.length > 0 &&
              !updatedImages.some((img) => img.is_primary)
            ) {
              updatedImages[0].is_primary = true;
            }
            onImagesChanged(updatedImages);
          } else {
            // Single image mode
            onImageRemoved?.();
          }
        },
      },
    ]);
  };

  const handleSetPrimary = (imageUrl: string) => {
    if (!multiple || !onImagesChanged) return;

    const updatedImages = images.map((img) => ({
      ...img,
      is_primary: img.url === imageUrl,
    }));
    onImagesChanged(updatedImages);
  };

  const renderUploadButton = () => {
    if (Platform.OS === "web") {
      // Web-optimized UI with upload icon
      return (
        <View className="items-center gap-2">
          {isLoading ? (
            <View className="animate-spin">
              <Upload size={24} className="text-muted-foreground" />
            </View>
          ) : (
            <>
              <Upload size={24} className="text-muted-foreground" />
              <Text className="text-sm font-medium text-muted-foreground">
                {defaultPlaceholder}
              </Text>
              <Text className="text-xs text-muted-foreground text-center">
                {t("ui.image_uploader.click_to_upload_image")}
              </Text>
            </>
          )}
        </View>
      );
    }

    // Native UI with camera icon
    return (
      <View className="items-center gap-2">
        {isLoading ? (
          <View className="animate-spin">
            <Camera size={24} className="text-muted-foreground" />
          </View>
        ) : (
          <>
            <ImageIcon size={24} className="text-muted-foreground" />
            <Text className="text-sm font-medium text-muted-foreground">
              {defaultPlaceholder}
            </Text>
            <Text className="text-xs text-muted-foreground text-center">
              {t("ui.image_uploader.tap_camera_gallery")}
            </Text>
          </>
        )}
      </View>
    );
  };

  if (multiple) {
    // Multiple images mode
    return (
      <View className={cn("gap-3", className)}>
        {/* Image Grid */}
        {images.length > 0 && (
          <View className="flex-row flex-wrap gap-3">
            {images.map((image, index) => (
              <View key={image.url} className="relative">
                <View
                  className={cn(
                    "w-24 h-24 rounded-lg border overflow-hidden",
                    image.is_primary
                      ? "border-primary border-2"
                      : "border-border"
                  )}
                >
                  <Image
                    source={{ uri: image.url }}
                    className="w-full h-full"
                    resizeMode="cover"
                    style={
                      Platform.OS === "web" ? { objectFit: "cover" } : undefined
                    }
                  />
                </View>

                {/* Primary badge */}
                {image.is_primary && (
                  <View className="absolute top-1 left-1 bg-primary px-2 py-0.5 rounded">
                    <Text className="text-xs text-primary-foreground font-medium">
                      Primary
                    </Text>
                  </View>
                )}

                {/* Remove button */}
                {!disabled && !isLoading && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onPress={() => handleRemoveImage(image.url)}
                    accessible={true}
                    accessibilityLabel="Remove image"
                  >
                    <Trash2 size={12} className="text-destructive-foreground" />
                  </Button>
                )}

                {/* Set as primary button */}
                {!image.is_primary && !disabled && !isLoading && (
                  <TouchableOpacity
                    onPress={() => handleSetPrimary(image.url)}
                    className="absolute bottom-1 left-1 bg-background/80 px-2 py-0.5 rounded"
                    accessible={true}
                    accessibilityLabel="Set as primary image"
                  >
                    <Text className="text-xs font-medium">Set Primary</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Add more button */}
        {images.length < maxImages && (
          <TouchableOpacity
            onPress={showImagePicker}
            disabled={disabled || isLoading}
            className={cn(
              "w-24 h-24 bg-muted rounded-lg border border-dashed border-border justify-center items-center",
              (disabled || isLoading) && "opacity-50",
              Platform.OS === "web" && "hover:bg-muted/80 transition-colors"
            )}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Add another image"
            accessibilityRole="button"
          >
            {isLoading ? (
              <View className="animate-spin">
                <Upload size={20} className="text-muted-foreground" />
              </View>
            ) : (
              <View className="items-center gap-1">
                <Upload size={20} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">Add</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <Text className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images • First image will be used as
          primary
        </Text>
      </View>
    );
  }

  // Single image mode (existing behavior)
  return (
    <View className={cn("relative", className)}>
      <TouchableOpacity
        onPress={showImagePicker}
        disabled={disabled || isLoading}
        className={cn(
          "w-full h-32 bg-muted rounded-lg border border-border justify-center items-center overflow-hidden",
          (disabled || isLoading) && "opacity-50",
          value && "border-primary",
          // Web-specific hover effect
          Platform.OS === "web" && "hover:bg-muted/80 transition-colors"
        )}
        activeOpacity={0.7}
        // Web accessibility
        accessible={true}
        accessibilityLabel={value ? "Change image" : "Upload image"}
        accessibilityRole="button"
      >
        {value ? (
          <Image
            source={{ uri: value }}
            className="w-full h-full"
            resizeMode="cover"
            // Web optimization
            style={Platform.OS === "web" ? { objectFit: "cover" } : undefined}
          />
        ) : (
          renderUploadButton()
        )}
      </TouchableOpacity>

      {value && !disabled && !isLoading && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onPress={() => handleRemoveImage()}
          accessible={true}
          accessibilityLabel="Remove image"
        >
          <Trash2 size={16} className="text-destructive-foreground" />
        </Button>
      )}

      {isLoading && (
        <View className="absolute inset-0 bg-background/50 rounded-lg justify-center items-center">
          <Text className="text-sm text-muted-foreground">Uploading...</Text>
        </View>
      )}
    </View>
  );
}

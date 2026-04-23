import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Alert, Platform, TouchableOpacity, Image, Modal, SafeAreaView, Dimensions, TextInput, KeyboardAvoidingView } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUploadFile } from "@/services/upload";
import { cn } from "@/lib/utils";
import type {
  ProductResponse,
  CreateProductRequest,
  ProductVariant,
} from "@/services/product-management";
import { categoriesApi, type Category } from "@/services/categories";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { CategorySelector } from "../vendor/CategorySelector";

export interface ProductImage {
  url: string;
  alt?: string;
  is_primary: boolean;
}

interface ProductModalProps {
  product?: ProductResponse;
  onSubmit: (product: Partial<CreateProductRequest>) => void;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "primary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

// Simple Modal wrapper for mobile
const SimpleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  footer: React.ReactNode; 
}) => {
  const { height } = Dimensions.get('window');
  const resolvedColors = useResolvedThemeColors();
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: 16, 
            borderBottomWidth: 1, 
            borderBottomColor: resolvedColors?.border || '#e5e7eb' 
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          <View style={{ 
            padding: 16, 
            borderTopWidth: 1, 
            borderTopColor: resolvedColors?.border || '#e5e7eb',
            backgroundColor: resolvedColors?.background || '#ffffff'
          }}>
            {footer}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Web Dialog wrapper
const WebDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  footer: React.ReactNode; 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollView className="max-h-[80vh] px-4 py-2">
          {children}
        </ScrollView>
        <DialogFooter className="flex-row gap-3">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Isolated ImageUploader component to avoid navigation context issues
const ModalImageUploader = React.memo(({
  images,
  onImagesChanged,
  isSubmitting,
  maxImages = 5
}: {
  images: ProductImage[];
  onImagesChanged: (images: ProductImage[]) => void;
  isSubmitting: boolean;
  maxImages?: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadFile = useUploadFile();
  const mounted = useRef(false); // Ref to track component mount status
  const resolvedColors = useResolvedThemeColors();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        if (mounted.current) {
          Alert.alert(
            "Permissions Required",
            "Sorry, we need camera and photo library permissions to upload images.",
            [{ text: "OK" }]
          );
        }
        return false;
      }
    }
    return true;
  };

  const handleImageUpload = async (uri: string, filename?: string) => {
    try {
      if (!mounted.current) return; // Prevent setting state if component unmounted
      setIsLoading(true);
      const finalFilename = filename || `image_${Date.now()}.jpg`;

      const result = await uploadFile.mutateAsync({
        uri,
        filename: finalFilename,
      });

      if (!mounted.current) return; // Prevent setting state if component unmounted after upload

      const uploadedUrl = result.fileCDNUrl || result.url;
      const newImage: ProductImage = {
        url: uploadedUrl,
        alt: "",
        is_primary: images.length === 0,
      };

      onImagesChanged([...images, newImage]);
    } catch (error) {
      console.error("Upload failed:", error);
      if (mounted.current) { // Only show alert if component is still mounted
        Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      }
    } finally {
      if (mounted.current) { // Only set loading state if component is still mounted
        setIsLoading(false);
      }
    }
  };

  const showImagePicker = async () => {
    if (isSubmitting || isLoading) return;

    if (images.length >= maxImages) {
      if (mounted.current) {
        Alert.alert("Maximum Images Reached", `You can only upload up to ${maxImages} images.`);
      }
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    if (Platform.OS === "web") {
      pickImageFromGallery();
    } else {
      if (mounted.current) {
        Alert.alert("Select Image", "Choose how you want to select an image", [
          { text: "Cancel", style: "cancel" },
          { text: "Camera", onPress: () => pickImageFromCamera() },
          { text: "Gallery", onPress: () => pickImageFromGallery() },
        ]);
      }
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const filename = asset.fileName || `camera_${Date.now()}.jpg`;
      await handleImageUpload(asset.uri, filename);
    } catch (error) {
      console.error("Error picking image from camera:", error);
      if (mounted.current) { // Only show alert if component is still mounted
        Alert.alert("Error", "Failed to take photo. Please try again.");
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const filename = asset.fileName || `gallery_${Date.now()}.jpg`;
      await handleImageUpload(asset.uri, filename);
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      if (mounted.current) { // Only show alert if component is still mounted
        Alert.alert("Error", "Failed to select image. Please try again.");
      }
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    if (isSubmitting || !mounted.current) return;

    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          if (mounted.current) {
            const updatedImages = images.filter((img) => img.url !== imageUrl);
            if (updatedImages.length > 0 && !updatedImages.some((img) => img.is_primary)) {
              updatedImages[0].is_primary = true;
            }
            onImagesChanged(updatedImages);
          }
        },
      },
    ]);
  };

  const handleSetPrimary = (imageUrl: string) => {
    if (!mounted.current) return;
    
    const updatedImages = images.map((img) => ({
      ...img,
      is_primary: img.url === imageUrl,
    }));
    onImagesChanged(updatedImages);
  };

  return (
    <View className="mb-6">
      <Text className="text-sm font-medium mb-3">Product Images</Text>
      <View className="gap-3">
        {/* Image Grid */}
        {images.length > 0 && (
          <View className="flex-row flex-wrap gap-3">
            {images.map((image, index) => (
              <View key={image.url} className="relative">
                <View
                  className={cn(
                    "w-24 h-24 rounded-lg overflow-hidden",
                    image.is_primary ? "border-2 border-foreground" : "border border-border"
                  )}
                >
                  <Image
                    source={{ uri: image.url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Primary badge */}
                {image.is_primary && (
                  <View className="absolute top-1 left-1 bg-foreground px-2 py-1 rounded">
                    <Text className="text-xs text-background font-medium">
                      Primary
                    </Text>
                  </View>
                )}

                {/* Remove button */}
                {!isSubmitting && !isLoading && (
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(image.url)}
                    className="absolute top-1 right-1 bg-destructive rounded-full p-1 w-6 h-6 items-center justify-center"
                  >
                    <Trash2 size={12} color="white" />
                  </TouchableOpacity>
                )}

                {/* Set as primary button */}
                {!image.is_primary && !isSubmitting && !isLoading && (
                  <TouchableOpacity
                    onPress={() => handleSetPrimary(image.url)}
                    className="absolute bottom-1 left-1 bg-background/80 px-2 py-1 rounded"
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
            disabled={isSubmitting || isLoading}
            className={cn(
              "w-24 h-24 bg-muted rounded-lg border border-dashed border-border items-center justify-center",
              (isSubmitting || isLoading) && "opacity-50"
            )}
          >
            {isLoading ? (
              <Upload size={20} color="#666" />
            ) : (
              <View className="items-center gap-1">
                <Upload size={20} color="#666" />
                <Text className="text-xs text-muted-foreground">Add</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <Text className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images • First image will be used as primary
        </Text>
      </View>
    </View>
  );
});

// Variant Management Component
const VariantManager = React.memo(({
  variants,
  onVariantsChanged,
  disabled = false,
}: {
  variants: ProductVariant[];
  onVariantsChanged: (variants: ProductVariant[]) => void;
  disabled?: boolean;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState({
    sku: generateUniqueVariantSKU(),
    name: "", // Full variant name
    price: "",
    inventory_quantity: "",
    imageUrl: "",
  });
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" }
  ]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const uploadFile = useUploadFile();
  const mounted = useRef(false);
  const resolvedColors = useResolvedThemeColors();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const resetForm = () => {
    setVariantForm({
      sku: generateUniqueVariantSKU(), // Auto-generate new variant SKU
      name: "",
      price: "",
      inventory_quantity: "",
      imageUrl: "",
    });
    setAttributes([{ key: "", value: "" }]);
    setEditingIndex(null);
  };

  const handleImageUpload = async () => {
    if (isUploadingImage || disabled) return;

    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant photo library access to upload variant images."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (!mounted.current) return;

      setIsUploadingImage(true);

      const filename = asset.fileName || `variant_${Date.now()}.jpg`;
      const uploadResult = await uploadFile.mutateAsync({
        uri: asset.uri,
        filename: filename,
      });

      if (!mounted.current) return;

      const uploadedUrl = uploadResult.fileCDNUrl || uploadResult.url;
      setVariantForm({ ...variantForm, imageUrl: uploadedUrl });
    } catch (error) {
      console.error("Upload failed:", error);
      if (mounted.current) {
        Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      }
    } finally {
      if (mounted.current) {
        setIsUploadingImage(false);
      }
    }
  };

  const handleRemoveVariantImage = () => {
    setVariantForm({ ...variantForm, imageUrl: "" });
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleAddVariant = () => {
    // Validate required fields
    if (!variantForm.sku || !variantForm.name || !variantForm.price || !variantForm.inventory_quantity) {
      Alert.alert("Required Fields", "Please fill in all required fields (SKU, Name, Price, and Stock).");
      return;
    }

    // Convert attributes array to object, filtering out empty entries
    const attributesObj: Record<string, string> = {};
    attributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attributesObj[attr.key.trim()] = attr.value.trim();
      }
    });

    const newVariant: any = {
      sku: variantForm.sku.trim(),
      name: variantForm.name.trim(),
      price: Number(variantForm.price),
      inventory_quantity: Number(variantForm.inventory_quantity),
      attributes: attributesObj,
      is_active: true,
    };

    // Add image_url if provided (optional)
    if (variantForm.imageUrl) {
      newVariant.image_url = variantForm.imageUrl;
    }

    if (editingIndex !== null) {
      // Update existing variant
      const updatedVariants = [...variants];
      updatedVariants[editingIndex] = newVariant as ProductVariant;
      onVariantsChanged(updatedVariants);
    } else {
      // Add new variant
      onVariantsChanged([...variants, newVariant as ProductVariant]);
    }
    resetForm();
  };

  const handleEditVariant = (index: number) => {
    const variant = variants[index] as any;
    setVariantForm({
      sku: variant.sku,
      name: variant.name || "",
      price: variant.price.toString(),
      inventory_quantity: variant.inventory_quantity?.toString() || "0",
      imageUrl: variant.image_url || "",
    });
    
    // Convert attributes object to array
    const attributesArray = variant.attributes 
      ? Object.entries(variant.attributes).map(([key, value]) => ({ key, value: value as string }))
      : [{ key: "", value: "" }];
    setAttributes(attributesArray.length > 0 ? attributesArray : [{ key: "", value: "" }]);
    
    setEditingIndex(index);
  };

  const handleRemoveVariant = (index: number) => {
    Alert.alert(
      "Remove Variant",
      "Are you sure you want to remove this variant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            onVariantsChanged(variants.filter((_, i) => i !== index));
            if (editingIndex === index) resetForm();
          },
        },
      ]
    );
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium">Product Variants (Optional)</Text>
      
      {/* Variant List */}
      {variants.length > 0 && (
        <View className="gap-2 mb-2">
          {variants.map((variant, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between bg-muted rounded-lg p-3 border border-border"
            >
              {/* Variant Image */}
              {(variant as any).image_url && (
                <Image
                  source={{ uri: (variant as any).image_url }}
                  className="w-12 h-12 rounded-md mr-3"
                  resizeMode="cover"
                />
              )}
              
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  {variant.name}
                </Text>
                <Text className="text-xs text-muted-foreground mb-1">
                  SKU: {variant.sku}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Price: TShs {variant.price.toLocaleString()} • Stock: {variant.inventory_quantity}
                </Text>
                {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                  <View className="flex-row flex-wrap gap-1 mt-1">
                    {Object.entries(variant.attributes).map(([key, value], i) => (
                      <View key={i} className="bg-muted-foreground/10 px-2 py-0.5 rounded">
                        <Text className="text-xs text-muted-foreground">
                          {key}: {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              {!disabled && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleEditVariant(index)}
                    className="bg-primary rounded-full p-2"
                  >
                    <Edit2 size={14} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveVariant(index)}
                    className="bg-destructive rounded-full p-2"
                  >
                    <Trash2 size={14} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Add/Edit Form */}
      {!disabled && (
        <View className="border border-border rounded-lg p-3 bg-muted/30">
          <Text className="text-xs font-medium text-muted-foreground mb-3">
            {editingIndex !== null ? "Edit Variant" : "Add New Variant"}
          </Text>
          <View className="gap-3">
            {/* Variant Image Upload */}
            <View className="gap-2">
              <Text className="text-xs font-medium text-muted-foreground">Variant Image (Optional)</Text>
              {variantForm.imageUrl ? (
                <View className="relative">
                  <Image
                    source={{ uri: variantForm.imageUrl }}
                    className="w-24 h-24 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={handleRemoveVariantImage}
                    className="absolute top-1 right-1 bg-destructive rounded-full p-1.5"
                  >
                    <Trash2 size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleImageUpload}
                  disabled={isUploadingImage}
                  className="w-24 h-24 bg-muted rounded-lg border border-dashed border-border items-center justify-center"
                >
                  {isUploadingImage ? (
                    <Upload size={20} color="#666" />
                  ) : (
                    <View className="items-center gap-1">
                      <Upload size={20} color="#666" />
                      <Text className="text-xs text-muted-foreground">Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* SKU - Auto-generated */}
            <View>
              <Text className="text-xs font-medium text-muted-foreground mb-2">
                Variant SKU (Auto-generated)
              </Text>
              <View className="border border-border rounded-lg p-3 bg-muted/50">
                <Text className="text-sm text-foreground font-mono">
                  {variantForm.sku}
                </Text>
              </View>
            </View>

            {/* Variant Name - Required */}
            <View>
              <Text className="text-xs font-medium text-muted-foreground mb-2">
                Variant Name <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={variantForm.name}
                onChangeText={(value) => setVariantForm({ ...variantForm, name: value })}
                placeholder="e.g., MacBook Pro 14 M5 512GB SSD Space Black"
                editable={!disabled}
              />
              <Text className="text-xs text-muted-foreground mt-1">
                Full descriptive name for this variant
              </Text>
            </View>

            {/* Price and Stock - Required */}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs font-medium text-muted-foreground mb-2">
                  Price (TShs) <Text className="text-destructive">*</Text>
                </Text>
                <Input
                  value={variantForm.price}
                  onChangeText={(value) => setVariantForm({ ...variantForm, price: value })}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium text-muted-foreground mb-2">
                  Stock <Text className="text-destructive">*</Text>
                </Text>
                <Input
                  value={variantForm.inventory_quantity}
                  onChangeText={(value) => setVariantForm({ ...variantForm, inventory_quantity: value })}
                  placeholder="Enter stock"
                  keyboardType="numeric"
                  editable={!disabled}
                />
              </View>
            </View>

            {/* Attributes - Dynamic Key-Value Pairs */}
            <View>
              <Text className="text-xs font-medium text-muted-foreground mb-2">
                Attributes (Optional)
              </Text>
              <View className="gap-2">
                {attributes.map((attr, index) => (
                  <View key={index} className="flex-row gap-2 items-center">
                    <View className="flex-1">
                      <Input
                        value={attr.key}
                        onChangeText={(value) => handleAttributeChange(index, 'key', value)}
                        placeholder="Key (e.g., chip, color)"
                        editable={!disabled}
                      />
                    </View>
                    <View className="flex-1">
                      <Input
                        value={attr.value}
                        onChangeText={(value) => handleAttributeChange(index, 'value', value)}
                        placeholder="Value (e.g., M5, Space Black)"
                        editable={!disabled}
                      />
                    </View>
                    {attributes.length > 1 && !disabled && (
                      <TouchableOpacity
                        onPress={() => handleRemoveAttribute(index)}
                        className="bg-destructive rounded-full p-2"
                      >
                        <Trash2 size={14} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              {!disabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleAddAttribute}
                  className="mt-2"
                >
                  <Plus size={14} color={resolvedColors.foreground} />
                  <Text className="text-sm ml-1">Add Attribute</Text>
                </Button>
              )}
              <Text className="text-xs text-muted-foreground mt-1">
                Add custom attributes like chip, color, storage, size, etc.
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Button
                variant="primary"
                size="sm"
                onPress={handleAddVariant}
                disabled={!variantForm.name || !variantForm.price || !variantForm.inventory_quantity || isUploadingImage}
                className="flex-1"
              >
                <Text className="text-sm font-semibold">
                  {editingIndex !== null ? "Update Variant" : "Add Variant"}
                </Text>
              </Button>
              {editingIndex !== null && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={resetForm}
                  className="flex-1"
                >
                  <Text className="text-sm font-semibold">Cancel</Text>
                </Button>
              )}
            </View>
          </View>
        </View>
      )}
      
      <Text className="text-xs text-muted-foreground">
        {variants.length > 0 
          ? `${variants.length} variant${variants.length > 1 ? 's' : ''} added.`
          : "Add variants if this product comes in different options (e.g., sizes, colors)."}
      </Text>
    </View>
  );
});

// Instagram-like Tags Input Component
const TagsInput = React.memo(({
  tags,
  onTagsChanged,
  disabled = false,
  placeholder = "Add tags..."
}: {
  tags: string[];
  onTagsChanged: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<TextInput>(null);
  const resolvedColors = useResolvedThemeColors();
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChanged([...tags, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChanged(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Auto-add tag on comma or space
    if (text.includes(',') || text.includes(' ')) {
      const newTags = text.split(/[,\s]+/).filter(t => t.trim().length > 0);
      if (newTags.length > 0) {
        const uniqueNewTags = newTags.filter(tag => !tags.includes(tag.trim()));
        if (uniqueNewTags.length > 0) {
          onTagsChanged([...tags, ...uniqueNewTags.map(t => t.trim())]);
        }
      }
      setInputValue("");
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.nativeEvent.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag on backspace when input is empty
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium">Tags <Text className="text-destructive">*</Text></Text>
      <View className={cn(
        "border border-border rounded-lg p-3 min-h-[48px]",
        disabled && "bg-muted"
      )}>
        <View className="flex-row flex-wrap gap-2 items-center">
          {tags.map((tag, index) => (
            <View
              key={index}
              className="flex-row items-center bg-muted rounded-full pl-3 pr-2 py-1.5 gap-1.5 border border-border"
            >
              <Text className="text-sm text-foreground">{tag}</Text>
              {!disabled && (
                <TouchableOpacity
                  onPress={() => removeTag(tag)}
                  className="w-4 h-4 rounded-full bg-muted-foreground items-center justify-center"
                >
                  <X size={10} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {!disabled && (
            <TextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={tags.length === 0 ? placeholder : "Add more..."}
              placeholderTextColor={resolvedColors.mutedForeground}
              className="flex-1 min-w-[100px] text-sm text-foreground py-1"
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (inputValue.trim()) {
                  addTag(inputValue);
                }
              }}
            />
          )}
        </View>
      </View>
      <Text className="text-xs text-muted-foreground">
        Type and press Enter or comma to add tags. {tags.length > 0 && `${tags.length} tag${tags.length > 1 ? 's' : ''} added.`}
      </Text>
    </View>
  );
});

// Generate unique SKU
const generateUniqueSKU = () => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  return `SKU-${timestamp}-${randomString}`.toUpperCase();
};

// Generate unique variant SKU
const generateUniqueVariantSKU = () => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  return `VAR-${timestamp}-${randomString}`.toUpperCase();
};

export function ProductModal({
  product,
  onSubmit,
  triggerText,
  triggerVariant = "primary",
  triggerSize = "default",
  disabled = false,
}: ProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();

  // Convert product images to ProductImage format
  const convertToProductImages = (images: any[]): ProductImage[] => {
    if (!images || images.length === 0) return [];

    return images
      .map((img, index) => {
        if (typeof img === "string") {
          return {
            url: img,
            alt: "",
            is_primary: index === 0,
          };
        } else if (typeof img === "object" && "url" in img) {
          return {
            url: img.url,
            alt: img.alt_text || "",
            is_primary: img.is_primary || index === 0,
          };
        }
        return {
          url: "",
          alt: "",
          is_primary: index === 0,
        };
      })
      .filter((img) => img.url);
  };

  // Initialize with empty form data
  const getInitialFormData = (productData?: ProductResponse) => ({
    name: productData?.name || "",
    description: productData?.description || "",
    sku: productData?.sku || generateUniqueSKU(), // Auto-generate SKU for new products
    price: (productData?.sale_price || productData?.base_price || 0).toString(),
    stock: (productData?.inventory_quantity || 0).toString(),
    low_stock_threshold: (productData?.low_stock_threshold || 10).toString(),
    weight: (productData?.weight || 0).toString(),
    tags: productData?.tags?.join(", ") || "",
  });

  const [formData, setFormData] = useState(getInitialFormData(product));
  const [productImages, setProductImages] = useState<ProductImage[]>(
    convertToProductImages(product?.images || [])
  );
  const [productVariants, setProductVariants] = useState<ProductVariant[]>(
    product?.variants || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    // Initialize only from product.categories, ignore product.category_ids
    (product?.categories as Category[]) || []
  );

  // Reset form data when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(product));
      setProductImages(convertToProductImages(product?.images || []));
      setProductVariants(product?.variants || []);
      // Initialize selectedCategories only from product.categories
      setSelectedCategories((product?.categories as Category[]) || []);
      setIsSubmitting(false);
    }
  }, [isOpen, product]);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await categoriesApi.getCategories();
          setCategories(response.items || []);
          // If editing a product, ensure selectedCategories is populated with full Category objects
          if (product?.categories) {
            const productCategories = (product.categories as Category[]) || [];
            // Match product categories with fetched categories to ensure full objects
            const matchedCategories = productCategories
              .map((pc) =>
                response.items.find((c) => c.category_id === pc.category_id)
              )
              .filter((c): c is Category => !!c);
            setSelectedCategories(matchedCategories);
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
          Alert.alert('Error', 'Failed to load categories. Please try again.');
        }
      };
      
      fetchCategories();
    }
  }, [isOpen, product]);

  const resetForm = () => {
    setFormData(getInitialFormData()); // This will generate a new SKU
    setProductImages([]);
    setProductVariants([]);
    setSelectedCategories([]);
    setIsSubmitting(false);
  };

  // Generate short description from the first few words of the description
  const generateShortDescription = (description: string): string => {
    if (!description.trim()) return "";

    const words = description.trim().split(/\s+/);
    const shortDesc = words.slice(0, 15).join(" "); // Take first 15 words

    // Add ellipsis if the description was truncated
    return words.length > 15 ? `${shortDesc}...` : shortDesc;
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    // Reset form when closing modal if it's in create mode
    if (!product) {
      resetForm();
    }
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.stock || selectedCategories.length === 0 || !formData.tags.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Map selectedCategories to ensure compatibility with CreateProductRequest
      const formattedCategories: Category[] = selectedCategories.map((cat) => ({
        ...cat,
        is_featured: cat.is_featured ?? false, // Default to false if undefined
        metadata: cat.metadata ?? {}, // Default to empty object if undefined
      }));

      const productData: Partial<CreateProductRequest> = {
        name: formData.name,
        description: formData.description,
        short_description: generateShortDescription(formData.description),
        sku: formData.sku, // Auto-generated unique SKU
        slug: formData.sku, // Remove once backend handles slug creation
        base_price: Number(formData.price),
        sale_price: Number(formData.price),
        inventory_quantity: Number(formData.stock),
        low_stock_threshold: Number(formData.low_stock_threshold),
        weight: Number(formData.weight) || 0,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        category_ids: selectedCategories.map((cat) => cat.category_id), // Derived from selectedCategories
        categories: formattedCategories, // Full Category objects
        inventory_tracking: true,
        requires_shipping: true,
        is_active: true,
        is_featured: false,
        has_variants: productVariants.length > 0, // Set based on variants
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
        },
        images: productImages.map((img) => ({
          url: img.url,
          alt_text: img.alt,
          is_primary: img.is_primary,
        })),
      };

      // Add variants if any exist
      if (productVariants.length > 0) {
        (productData as any).variants = productVariants;
      }

      console.log("ProductModal submitting:", productData);
      await onSubmit(productData);

      // Reset form after successful creation (not edit)
      if (!product) {
        resetForm();
      }

      handleClose();
    } catch (error) {
      console.error("Submit failed:", error);
      Alert.alert("Error", "Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTrigger = () => {
    if (triggerSize === "icon") {
      return (
        <Button
          variant={triggerVariant}
          size="icon"
          onPress={handleOpen}
          disabled={disabled}
        >
          {product ? (
            <Edit2 size={16} className="text-muted-foreground" color={resolvedColors.foreground} />
          ) : (
            <Plus size={16} className="text-white" color={resolvedColors.primary} />
          )}
        </Button>
      );
    }

    return (
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onPress={handleOpen}
        disabled={disabled}
        className="flex-row items-center gap-2"
        style={{
          minHeight: 44,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {!product && <Plus size={20} color={resolvedColors.foreground} />}
        <Text
          style={{ color: product ? undefined : resolvedColors.foreground, fontWeight: "600" }}
        >
          {triggerText || (product ? "Edit" : "Add Product")}
        </Text>
      </Button>
    );
  };

  const renderContent = () => (
    <View className="py-2">
      <ModalImageUploader
        images={productImages}
        onImagesChanged={setProductImages}
        isSubmitting={isSubmitting}
      />

      {isDesktop ? (
        <View className="gap-4">
          {/* Row 1: Product Name and Price */}
          <View className="flex-row gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-sm font-medium">
                Product Name <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.name}
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                placeholder="Enter product name"
                editable={!isSubmitting}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-sm font-medium">
                Price <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.price}
                onChangeText={(value) => setFormData({ ...formData, price: value })}
                placeholder="Enter product price"
                keyboardType="numeric"
                editable={!isSubmitting}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Row 2: Stock and Low Stock Threshold */}
          <View className="flex-row gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-sm font-medium">
                Stock <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.stock}
                onChangeText={(value) => setFormData({ ...formData, stock: value })}
                placeholder="Enter stock quantity"
                keyboardType="numeric"
                editable={!isSubmitting}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-sm font-medium">Low Stock Threshold</Text>
              <Input
                value={formData.low_stock_threshold}
                onChangeText={(value) =>
                  setFormData({ ...formData, low_stock_threshold: value })
                }
                placeholder="Enter low stock threshold"
                keyboardType="numeric"
                editable={!isSubmitting}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Row 3: SKU and Weight */}
          <View className="flex-row gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-sm font-medium text-muted-foreground">
                SKU (Auto-generated)
              </Text>
              <View className="border border-border rounded-lg p-3">
                <Text className="text-sm text-foreground font-mono">
                  {formData.sku}
                </Text>
              </View>
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-sm font-medium">Weight (grams)</Text>
              <Input
                value={formData.weight}
                onChangeText={(value) =>
                  setFormData({ ...formData, weight: value })
                }
                placeholder="Enter product weight"
                keyboardType="numeric"
                editable={!isSubmitting}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Full-width Description */}
          <View className="gap-2">
            <Text className="text-sm font-medium">
              Description <Text className="text-destructive">*</Text>
            </Text>
            <Textarea
              value={formData.description}
              onChangeText={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Enter product description"
              multiline
              numberOfLines={2}
              className="min-h-[120px] py-2"
              textAlignVertical="top"
              editable={!isSubmitting}
              returnKeyType="default"
              blurOnSubmit={true}
            />
          </View>

          {/* Full-width components */}
          <TagsInput
            tags={formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []}
            onTagsChanged={(newTags) => setFormData({ ...formData, tags: newTags.join(', ') })}
            disabled={isSubmitting}
          />
          <CategorySelector
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            disabled={isSubmitting}
          />
          <VariantManager
            variants={productVariants}
            onVariantsChanged={setProductVariants}
            disabled={isSubmitting}
          />
        </View>
      ) : (
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium">
              Product Name <Text className="text-destructive">*</Text>
            </Text>
            <Input
              value={formData.name}
              onChangeText={(value) => setFormData({ ...formData, name: value })}
              placeholder="Enter product name"
              editable={!isSubmitting}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium">
              Description <Text className="text-destructive">*</Text>
            </Text>
            <Textarea
              value={formData.description}
              onChangeText={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Enter product description"
              multiline
              numberOfLines={2}
              className="min-h-[120px] py-2"
              textAlignVertical="top"
              editable={!isSubmitting}
              returnKeyType="default"
              blurOnSubmit={true}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-muted-foreground">
              SKU (Auto-generated)
            </Text>
            <View className="border border-border rounded-lg p-3">
              <Text className="text-sm text-foreground font-mono">
                {formData.sku}
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium">
              Price <Text className="text-destructive">*</Text>
            </Text>
            <Input
              value={formData.price}
              onChangeText={(value) => setFormData({ ...formData, price: value })}
              placeholder="Enter product price"
              keyboardType="numeric"
              editable={!isSubmitting}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium">
              Stock <Text className="text-destructive">*</Text>
            </Text>
            <Input
              value={formData.stock}
              onChangeText={(value) => setFormData({ ...formData, stock: value })}
              placeholder="Enter stock quantity"
              keyboardType="numeric"
              editable={!isSubmitting}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium">Low Stock Threshold</Text>
            <Input
              value={formData.low_stock_threshold}
              onChangeText={(value) =>
                setFormData({ ...formData, low_stock_threshold: value })
              }
              placeholder="Enter low stock threshold"
              keyboardType="numeric"
              editable={!isSubmitting}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium">Weight (grams)</Text>
            <Input
              value={formData.weight}
              onChangeText={(value) =>
                setFormData({ ...formData, weight: value })
              }
              placeholder="Enter product weight"
              keyboardType="numeric"
              editable={!isSubmitting}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          <TagsInput
            tags={formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []}
            onTagsChanged={(newTags) => setFormData({ ...formData, tags: newTags.join(', ') })}
            disabled={isSubmitting}
          />

          <CategorySelector
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            disabled={isSubmitting}
          />

          <VariantManager
            variants={productVariants}
            onVariantsChanged={setProductVariants}
            disabled={isSubmitting}
          />
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View className="flex-row gap-3">
      <Button
        variant="outline"
        onPress={handleClose}
        disabled={isSubmitting}
        className="flex-1"
      >
        <Text className="font-semibold text-foreground">Cancel</Text>
      </Button>

      <Button
        variant="primary"
        disabled={
          !formData.name ||
          !formData.description ||
          !formData.price ||
          !formData.stock ||
          selectedCategories.length === 0 ||
          !formData.tags.trim() ||
          isSubmitting
        }
        onPress={handleSubmit}
        className="flex-1"
      >
        <Text className="text-foreground font-semibold">
          {isSubmitting
            ? "Saving..."
            : product
            ? "Update Product"
            : "Add Product"}
        </Text>
      </Button>
    </View>
  );

  return (
    <>
      {isDesktop ? (
        <WebDialog
          isOpen={isOpen}
          onClose={handleClose}
          title={product ? "Edit Product" : "Add New Product"}
          footer={renderFooter()}
        >
          {renderContent()}
        </WebDialog>
      ) : (
        <SimpleModal
          isOpen={isOpen}
          onClose={handleClose}
          title={product ? "Edit Product" : "Add New Product"}
          footer={renderFooter()}
        >
          {renderContent()}
        </SimpleModal>
      )}
      {renderTrigger()}
    </>
  );
}
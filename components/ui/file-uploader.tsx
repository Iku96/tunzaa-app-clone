import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Camera, FileText, Trash2, Upload } from "lucide-react-native";
import { Button } from "./button";
import { Text } from "./text";
import { cn } from "@/lib/utils";
import { useUploadFile } from "@/src/services/upload";
import { useI18n } from "@/hooks/useI18n";

interface FileUploaderProps {
  value?: string;
  onFileSelected?: (uploadedUrl: string) => void;
  onFileRemoved?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  acceptDocuments?: boolean; // Allow document uploads (PDFs, etc.)
  acceptImages?: boolean; // Allow image uploads
  quality?: number;
  allowsEditing?: boolean;
  maxFileSize?: number; // in MB
}

export function FileUploader({
  value,
  onFileSelected,
  onFileRemoved,
  placeholder,
  className,
  disabled = false,
  acceptDocuments = true,
  acceptImages = true,
  quality = 0.8,
  allowsEditing = true,
  maxFileSize = 10, // 10MB default
}: FileUploaderProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const defaultPlaceholder = placeholder || t("ui.file_uploader.upload_file");

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          t("ui.file_uploader.permissions_required"),
          t("ui.file_uploader.permissions_message"),
          [{ text: "OK" }]
        );
        return false;
      }
    }
    return true;
  };

  const validateFileSize = (fileSize?: number) => {
    if (!fileSize) return true;

    const fileSizeInMB = fileSize / (1024 * 1024);
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

  const handleFileUpload = async (
    uri: string,
    filename?: string,
    mimeType?: string
  ) => {
    try {
      setIsLoading(true);

      // Generate filename if not provided
      const finalFilename = filename || `file_${Date.now()}`;

      const result = await uploadFile.mutateAsync({
        uri,
        filename: finalFilename,
        mimeType,
      });

      const uploadedUrl = result.fileCDNUrl || result.url;
      onFileSelected?.(uploadedUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert(t("ui.file_uploader.upload_failed"), t("ui.file_uploader.upload_failed_message"), [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        quality,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (validateFileSize(asset.fileSize)) {
          const filename = asset.fileName || `camera_${Date.now()}.jpg`;
          await handleFileUpload(asset.uri, filename);
        }
      }
    } catch (error) {
      console.error("Error picking image from camera:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        quality,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (validateFileSize(asset.fileSize)) {
          const filename = asset.fileName || `gallery_${Date.now()}.jpg`;
          await handleFileUpload(asset.uri, filename);
        }
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const pickDocument = async () => {
    try {
      const pickerOptions =
        Platform.OS === "android"
          ? {
              type: "*/*", // Allow all file types on Android
              copyToCacheDirectory: true,
              multiple: false,
            }
          : {
              type: [
                "application/pdf",
                "image/*",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
                "*/*",
              ],
              copyToCacheDirectory: true,
              multiple: false,
            };

      const result = await DocumentPicker.getDocumentAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (validateFileSize(asset.size)) {
          await handleFileUpload(
            asset.uri,
            asset.name,
            asset.mimeType || undefined
          );
        }
      } else if (!result.canceled) {
        const legacyResult = result as any;
        if (legacyResult.type === "success") {
          if (validateFileSize(legacyResult.size)) {
            await handleFileUpload(
              legacyResult.uri,
              legacyResult.name,
              legacyResult.mimeType || undefined
            );
          }
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert(
        "Document Selection Error",
        "Failed to select document. This might be due to file permissions. Please try selecting a different file or check your device's file access permissions.",
        [{ text: "OK" }]
      );
    }
  };

  const pickFileFromWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateFileSize(file.size)) {
        const uri = URL.createObjectURL(file);
        handleFileUpload(uri, file.name, file.type);
      }
      // Reset the input value to allow re-selection of the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const showFilePicker = () => {
    if (disabled || isLoading) return;

    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }

    const hasPermissions = requestPermissions();
    if (!hasPermissions) return;

    const options = [];

    if (acceptImages) {
      options.push({
        text: "Camera",
        onPress: pickImageFromCamera,
      });
      options.push({
        text: "Photo Gallery",
        onPress: pickImageFromGallery,
      });
    }

    if (acceptDocuments) {
      options.push({
        text: "Browse Files",
        onPress: pickDocument,
      });
    }

    if (options.length === 1) {
      options[0].onPress();
    } else {
      Alert.alert("Select File", "Choose how you want to select a file", [
        { text: "Cancel", style: "cancel" },
        ...options,
      ]);
    }
  };

  const handleRemoveFile = () => {
    if (disabled) return;

    Alert.alert("Remove File", "Are you sure you want to remove this file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onFileRemoved?.(),
      },
    ]);
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  };

  const renderUploadButton = () => {
    return (
      <View className="items-center gap-2">
        {isLoading ? (
          <View className="animate-spin">
            <Upload size={24} className="text-muted-foreground" />
          </View>
        ) : (
          <>
            <FileText size={24} className="text-muted-foreground" />
            <Text className="text-sm font-medium text-muted-foreground">
              {defaultPlaceholder}
            </Text>
            <Text className="text-xs text-muted-foreground text-center">
              {Platform.OS === "web"
                ? t("ui.file_uploader.click_to_upload")
                : acceptDocuments && acceptImages
                ? t("ui.file_uploader.tap_to_select")
                : acceptDocuments
                ? t("ui.file_uploader.tap_browse_files")
                : t("ui.file_uploader.tap_camera_gallery")}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View className={cn("relative", className)}>
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef}
          type="file"
          accept={
            (acceptImages ? "image/*" : "") +
            (acceptDocuments && acceptImages ? "," : "") +
            (acceptDocuments ? ".pdf,.doc,.docx,.txt" : "")
          }
          style={{ display: "none" }}
          onChange={pickFileFromWeb}
        />
      )}
      <TouchableOpacity
        onPress={showFilePicker}
        disabled={disabled || isLoading}
        className={cn(
          "w-full h-32 bg-muted rounded-lg border border-border justify-center items-center overflow-hidden",
          (disabled || isLoading) && "opacity-50",
          value && "border-primary",
          Platform.OS === "web" && "hover:bg-muted/80 transition-colors"
        )}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={value ? "Change file" : "Upload file"}
        accessibilityRole="button"
      >
        {value ? (
          isImage(value) ? (
            <Image
              source={{ uri: value }}
              className="w-full h-full"
              resizeMode="cover"
              style={Platform.OS === "web" ? { objectFit: "cover" } : undefined}
            />
          ) : (
            <View className="items-center gap-2">
              <FileText size={32} className="text-primary" />
              <Text className="text-sm text-center text-muted-foreground">
                Document uploaded
              </Text>
            </View>
          )
        ) : (
          renderUploadButton()
        )}
      </TouchableOpacity>

      {value && !disabled && !isLoading && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onPress={handleRemoveFile}
          accessible={true}
          accessibilityLabel="Remove file"
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
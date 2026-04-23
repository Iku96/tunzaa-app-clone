import React, { useState } from "react";
import { View, Alert, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import * as Burnt from "burnt";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Upload, Download, FileText, X } from "lucide-react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useGetTemplate, useUploadFile } from "@/services/bulk-upload";
import { useI18n } from "@/hooks/useI18n";

interface BulkUploadModalProps {
  vendorId: string;
  storeId: string;
  onUploadSuccess?: () => void;
  triggerVariant?: "primary" | "outline" | "secondary";
  triggerSize?: "sm" | "lg" | "icon";
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  vendorId,
  storeId,
  onUploadSuccess,
  triggerVariant = "outline",
  triggerSize = "lg",
}) => {
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const { data: templateData } = useGetTemplate();
  const uploadMutation = useUploadFile();

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);

      if (!templateData) {
        Burnt.toast({
          title: "Error",
          message: "Template data not available",
          preset: "error",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        return;
      }

      if (Platform.OS === "web") {
        // For web, create a blob and trigger download
        const blob = new Blob([templateData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "product_upload_template.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Burnt.toast({
          title: "Template Downloaded",
          message: "CSV template downloaded successfully",
          preset: "done",
          haptic: "success",
          duration: 3,
          from: "top",
        });
      } else {
        // For mobile, save to file system and share
        const filename = "product_upload_template.csv";
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, templateData, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Save Product Upload Template",
            UTI: "public.comma-separated-values-text",
          });

          Burnt.toast({
            title: "Template Ready",
            message: "CSV template ready to save",
            preset: "done",
            haptic: "success",
            duration: 3,
            from: "top",
          });
        } else {
          Burnt.toast({
            title: "Saved to Documents",
            message: `Template saved to: ${filename}`,
            preset: "done",
            haptic: "success",
            duration: 4,
            from: "top",
          });
        }
      }
    } catch (error: any) {
      console.error("Error downloading template:", error);
      Burnt.toast({
        title: "Download Failed",
        message: error?.message || "Failed to download template",
        preset: "error",
        haptic: "error",
        duration: 4,
        from: "top",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/zip", "application/x-zip-compressed"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file type
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".csv") && !fileName.endsWith(".zip")) {
        Burnt.toast({
          title: "Invalid File",
          message: "Please select a CSV or ZIP file",
          preset: "error",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        return;
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size && file.size > maxSize) {
        Burnt.toast({
          title: "File Too Large",
          message: "File size must be less than 50MB",
          preset: "error",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        return;
      }

      setSelectedFile(file);
    } catch (error: any) {
      console.error("Error selecting file:", error);
      Burnt.toast({
        title: "Error",
        message: "Failed to select file",
        preset: "error",
        haptic: "error",
        duration: 3,
        from: "top",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Burnt.toast({
        title: t("bulk_upload.no_file_selected"),
        message: t("bulk_upload.select_file_message"),
        preset: "error",
        haptic: "error",
        duration: 3,
        from: "top",
      });
      return;
    }

    try {
      console.log("Uploading file:", {
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.mimeType,
        uri: selectedFile.uri,
      });

      await uploadMutation.mutateAsync({
        file: selectedFile,
        vendor_id: vendorId,
        store_id: storeId,
      });

      Burnt.toast({
        title: t("bulk_upload.upload_successful"),
        message: t("bulk_upload.products_processing"),
        preset: "done",
        haptic: "success",
        duration: 4,
        from: "top",
      });

      setSelectedFile(null);
      setOpen(false);
      onUploadSuccess?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      
      let errorMessage = "Failed to upload file";
      if (error?.originalError?.response?.data?.detail) {
        errorMessage = error.originalError.response.data.detail;
      } else if (error?.apiError?.message) {
        errorMessage = error.apiError.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Burnt.toast({
        title: t("bulk_upload.upload_failed"),
        message: errorMessage,
        preset: "error",
        haptic: "error",
        duration: 5,
        from: "top",
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className="flex-row items-center gap-2">
          <Upload size={16} className="text-foreground mr-2" color={resolvedColors.foreground} />
          <Text className="font-semibold">{t("modals.bulk_upload.title")}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="" 
        style={Platform.OS === "web" ? { width: "60vw", minWidth: "600px" } : { width: "100%" }}
      >
        <DialogHeader>
          <DialogTitle>{t("modals.bulk_upload.title")}</DialogTitle>
        </DialogHeader>

        <View className="py-4 space-y-6">
          {/* Download Template Section */}
          <View className="space-y-3">
            <Text className="text-base font-semibold text-foreground">
              Step 1: Download Template
            </Text>
            <Text className="text-sm text-muted-foreground mb-3">
              Download the CSV template, fill it with your product information, then upload it below.
            </Text>
            <Button
              variant="outline"
              onPress={handleDownloadTemplate}
              disabled={isDownloadingTemplate || !templateData}
              className="flex-row items-center"
            >
              {isDownloadingTemplate ? (
                <ActivityIndicator size="small" color={resolvedColors.foreground} className="mr-2" />
              ) : (
                <Download size={16} className="text-foreground mr-2" color={resolvedColors.foreground} />
              )}
              <Text className="font-semibold">
                {isDownloadingTemplate ? t("modals.bulk_upload.uploading") : t("modals.bulk_upload.download_template")}
              </Text>
            </Button>
          </View>

          {/* Upload Section */}
          <View className="space-y-3 border-t border-border pt-6">
            <Text className="text-base font-semibold text-foreground">
              Step 2: Upload Your File
            </Text>
            <Text className="text-sm text-muted-foreground mb-3">
              Upload a CSV file with your products, or a ZIP file containing the CSV and product images.
            </Text>

            {selectedFile ? (
              <View className="border border-border rounded-lg p-4 bg-muted">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <FileText size={24} className="text-foreground mr-3" color={resolvedColors.foreground} />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Unknown size"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={handleRemoveFile} className="ml-2">
                    <X size={20} color={resolvedColors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Button variant="outline" onPress={handleSelectFile} className="flex-row items-center">
                <Upload size={16} className="text-foreground mr-2" color={resolvedColors.foreground} />
                <Text className="font-semibold">Select File (CSV or ZIP)</Text>
              </Button>
            )}
          </View>

          {/* Info Section */}
          <View className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <Text className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t("modals.bulk_upload.important_notes")}
            </Text>
            <View className="space-y-1">
              <Text className="text-xs text-blue-800 dark:text-blue-200">
                • {t("modals.bulk_upload.note_csv")}
              </Text>
              <Text className="text-xs text-blue-800 dark:text-blue-200">
                • {t("modals.bulk_upload.note_zip")}
              </Text>
              <Text className="text-xs text-blue-800 dark:text-blue-200">
                • {t("modals.bulk_upload.note_size")}
              </Text>
              <Text className="text-xs text-blue-800 dark:text-blue-200">
                • {t("modals.bulk_upload.note_review")}
              </Text>
            </View>
          </View>
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={() => setOpen(false)}>
            <Text className="font-semibold">{t("common.cancel")}</Text>
          </Button>
          <Button
            variant="primary"
            onPress={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <ActivityIndicator size="small" color="white" className="mr-2" />
                <Text className="font-semibold text-white">{t("modals.bulk_upload.uploading")}</Text>
              </>
            ) : (
              <Text className="font-semibold text-white">{t("modals.bulk_upload.upload")}</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from "react";
import { View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Platform } from "react-native";
import * as Burnt from "burnt";
import { Package, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useGetBatches, type UploadBatch } from "@/services/bulk-upload";
import { BatchDetailsModal } from "./BatchDetailsModal";
import { format } from "date-fns";

interface BatchListModalProps {
  vendorId: string;
  triggerVariant?: "primary" | "outline" | "secondary";
  triggerSize?: "sm" | "lg" | "icon";
  onBatchAction?: () => void;
}

export const BatchListModal: React.FC<BatchListModalProps> = ({
  vendorId,
  triggerVariant = "outline",
  triggerSize = "lg",
  onBatchAction,
}) => {
  const resolvedColors = useResolvedThemeColors();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");

  const {
    data: batchesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetBatches(vendorId, selectedStatus, 0, 50, open);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex-row items-center">
            <Clock size={12} className="mr-1" color={resolvedColors.mutedForeground} />
            <Text className="text-xs font-semibold">Pending</Text>
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="flex-row items-center bg-green-100 dark:bg-green-900">
            <CheckCircle size={12} className="mr-1" color="#22c55e" />
            <Text className="text-xs font-semibold text-green-700 dark:text-green-300">Approved</Text>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex-row items-center">
            <XCircle size={12} className="mr-1" color="white" />
            <Text className="text-xs font-semibold text-white">Rejected</Text>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Text className="text-xs font-semibold">{status}</Text>
          </Badge>
        );
    }
  };

  const getValidationStatusColor = (batch: UploadBatch) => {
    if (batch.invalid_products > 0) {
      return "text-destructive";
    } else if (batch.warning_products > 0) {
      return "text-warning";
    } else if (batch.valid_products > 0) {
      return "text-green-600 dark:text-green-400";
    }
    return "text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleBatchActionComplete = () => {
    refetch();
    onBatchAction?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className="flex-row items-center gap-2">
          <Package size={16} className="text-foreground mr-2" color={resolvedColors.foreground} />
          <Text className="font-semibold">My Uploads</Text>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-h-[90vh]" 
        style={Platform.OS === "web" ? { width: "75vw", minHeight: "70vh" } : { width: "100%" }}
      >
        <DialogHeader>
          <DialogTitle>Bulk Upload Batches</DialogTitle>
        </DialogHeader>

        {/* Status Filter */}
        <View className="flex-row gap-2 py-3 border-b border-border">
          {["pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={selectedStatus === status ? "primary" : "outline"}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedStatus === status ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Button>
          ))}
        </View>

        {/* Batches List */}
        <ScrollView
          className="flex-1 py-4"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
          }
        >
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="large" color={resolvedColors.primary} />
              <Text className="text-muted-foreground mt-4">Loading batches...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-destructive mb-4">Failed to load batches</Text>
              <Button onPress={handleRefresh}>
                <Text className="text-white font-semibold">Retry</Text>
              </Button>
            </View>
          ) : !batchesData?.items || batchesData.items.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <Package size={48} color={resolvedColors.mutedForeground} />
              <Text className="text-muted-foreground mt-4 text-center">
                No {selectedStatus} batches found
              </Text>
              <Text className="text-sm text-muted-foreground mt-2 text-center px-6">
                Upload products using the "Bulk Upload" button to get started
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {batchesData.items.map((batch) => (
                <Card key={batch.batch_id} className="p-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-semibold text-foreground mb-1">
                        {batch.filename}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatDate(batch.uploaded_at)}
                      </Text>
                    </View>
                    {getStatusBadge(batch.status)}
                  </View>

                  {/* Batch Stats */}
                  <View className="flex-row gap-4 mb-3 flex-wrap">
                    <View>
                      <Text className="text-xs text-muted-foreground">Total Products</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {batch.total_products}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted-foreground">Valid</Text>
                      <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {batch.valid_products}
                      </Text>
                    </View>
                    {batch.warning_products > 0 && (
                      <View>
                        <Text className="text-xs text-muted-foreground">Warnings</Text>
                        <Text className="text-sm font-semibold text-warning">
                          {batch.warning_products}
                        </Text>
                      </View>
                    )}
                    {batch.invalid_products > 0 && (
                      <View>
                        <Text className="text-xs text-muted-foreground">Invalid</Text>
                        <Text className="text-sm font-semibold text-destructive">
                          {batch.invalid_products}
                        </Text>
                      </View>
                    )}
                    {batch.total_images > 0 && (
                      <View>
                        <Text className="text-xs text-muted-foreground">Images</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {batch.processed_images}/{batch.total_images}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Success Rate */}
                  {batch.summary?.success_rate !== undefined && (
                    <View className="mb-3">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs text-muted-foreground">Success Rate</Text>
                        <Text className={`text-xs font-semibold ${getValidationStatusColor(batch)}`}>
                          {batch.summary.success_rate}%
                        </Text>
                      </View>
                      <View className="h-2 bg-muted rounded-full overflow-hidden">
                        <View
                          className={`h-full ${
                            batch.summary.success_rate >= 80
                              ? "bg-green-500"
                              : batch.summary.success_rate >= 50
                              ? "bg-warning"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${batch.summary.success_rate}%` }}
                        />
                      </View>
                    </View>
                  )}

                  {/* Errors/Warnings Preview */}
                  {((batch?.errors?.length || 0) > 0 || (batch?.warnings?.length || 0) > 0) && (
                    <View className="bg-muted rounded-lg p-3 mb-3">
                      {(batch?.errors?.length || 0) > 0 && (
                        <View className="flex-row items-start mb-2">
                          <AlertCircle size={14} className="mr-2 mt-0.5" color={resolvedColors.destructive} />
                          <Text className="text-xs text-destructive flex-1">
                            {batch?.errors?.length || 0} error{(batch?.errors?.length || 0) > 1 ? "s" : ""} found
                          </Text>
                        </View>
                      )}
                      {(batch?.warnings?.length || 0) > 0 && (
                        <View className="flex-row items-start">
                          <AlertCircle size={14} className="mr-2 mt-0.5" color={resolvedColors.warning} />
                          <Text className="text-xs text-warning flex-1">
                            {batch?.warnings?.length || 0} warning{(batch?.warnings?.length || 0) > 1 ? "s" : ""}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Rejection Reason */}
                  {batch.status === "rejected" && batch.rejection_reason && (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3">
                      <Text className="text-xs font-semibold text-destructive mb-1">
                        Rejection Reason:
                      </Text>
                      <Text className="text-xs text-destructive">
                        {batch.rejection_reason}
                      </Text>
                    </View>
                  )}

                  {/* View Details Button */}
                  <BatchDetailsModal
                    batchId={batch.batch_id}
                    vendorId={vendorId}
                    onBatchAction={handleBatchActionComplete}
                  />
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from "react";
import { View, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import * as Burnt from "burnt";
import { CheckCircle, XCircle, AlertCircle, AlertTriangle, Package } from "lucide-react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import {
  useGetBatch,
  useGetBatchProducts,
  useApproveBatch,
  useRejectBatch,
  type BatchProduct,
} from "@/src/services/bulk-upload";
import { useProfileDetails } from "@/hooks/useProfileDetails";

interface BatchDetailsModalProps {
  batchId: string;
  vendorId: string;
  onBatchAction?: () => void;
}

export const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({
  batchId,
  vendorId,
  onBatchAction,
}) => {
  const resolvedColors = useResolvedThemeColors();
  const [open, setOpen] = useState(false);
  const [showProducts, setShowProducts] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  const { vendorDetails } = useProfileDetails();
  const userName = vendorDetails?.display_name || vendorDetails?.business_name || "User";

  const { data: batch, isLoading: isBatchLoading } = useGetBatch(batchId, open);
  const { data: productsData, isLoading: isProductsLoading } = useGetBatchProducts(
    batchId,
    0,
    100,
    open
  );
  const approveMutation = useApproveBatch();
  const rejectMutation = useRejectBatch();

  const isPending = batch?.status === "pending";
  const canApprove = isPending && batch && batch.valid_products > 0;

  const handleApprove = () => {
    if (!batch) return;

    const hasWarnings = batch.warning_products > 0;
    const hasErrors = batch.invalid_products > 0;

    let message = `You are about to approve ${batch.valid_products} product${
      batch.valid_products > 1 ? "s" : ""
    }.`;

    if (hasWarnings) {
      message += ` ${batch.warning_products} product${
        batch.warning_products > 1 ? "s have" : " has"
      } warnings but will be included.`;
    }

    if (hasErrors) {
      message += ` ${batch.invalid_products} invalid product${
        batch.invalid_products > 1 ? "s" : ""
      } will be skipped.`;
    }

    message += "\n\nDo you want to continue?";

    Alert.alert("Approve Batch", message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Approve",
        style: "default",
        onPress: async () => {
          try {
            await approveMutation.mutateAsync({
              batchId,
              data: {
                approved_by: userName,
                notes: "Batch approved from mobile app",
              },
            });

            Burnt.toast({
              title: "Batch Approved",
              message: "Products are being added to your store",
              preset: "done",
              haptic: "success",
              duration: 4,
              from: "top",
            });

            setOpen(false);
            onBatchAction?.();
          } catch (error: any) {
            console.error("Approve error:", error);

            let errorMessage = "Failed to approve batch";
            if (error?.originalError?.response?.data?.detail) {
              errorMessage = error.originalError.response.data.detail;
            } else if (error?.apiError?.message) {
              errorMessage = error.apiError.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }

            Burnt.toast({
              title: "Approval Failed",
              message: errorMessage,
              preset: "error",
              haptic: "error",
              duration: 5,
              from: "top",
            });
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Batch",
      "Are you sure you want to reject this batch? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync({
                batchId,
                data: {
                  rejected_by: userName,
                  reason: "Batch rejected by vendor",
                },
              });

              Burnt.toast({
                title: "Batch Rejected",
                message: "The batch has been rejected",
                preset: "done",
                haptic: "success",
                duration: 3,
                from: "top",
              });

              setOpen(false);
              onBatchAction?.();
            } catch (error: any) {
              console.error("Reject error:", error);

              let errorMessage = "Failed to reject batch";
              if (error?.originalError?.response?.data?.detail) {
                errorMessage = error.originalError.response.data.detail;
              } else if (error?.apiError?.message) {
                errorMessage = error.apiError.message;
              } else if (error?.message) {
                errorMessage = error.message;
              }

              Burnt.toast({
                title: "Rejection Failed",
                message: errorMessage,
                preset: "error",
                haptic: "error",
                duration: 5,
                from: "top",
              });
            }
          },
        },
      ]
    );
  };

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge variant="default" className="bg-green-100 dark:bg-green-900">
            <Text className="text-xs font-semibold text-green-700 dark:text-green-300">Valid</Text>
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900">
            <Text className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Warning</Text>
          </Badge>
        );
      case "invalid":
        return (
          <Badge variant="destructive">
            <Text className="text-xs font-semibold text-white">Invalid</Text>
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderProduct = (product: BatchProduct) => (
    <Card key={product.upload_id} className="p-3 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-semibold text-foreground mb-1">{product.name}</Text>
          <Text className="text-xs text-muted-foreground">SKU: {product.sku}</Text>
        </View>
        {getValidationBadge(product.validation_status)}
      </View>

      <View className="flex-row gap-4 mb-2">
        <View>
          <Text className="text-xs text-muted-foreground">Price</Text>
          <Text className="text-sm font-semibold text-foreground">
            TShs {product.base_price.toLocaleString()}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted-foreground">Stock</Text>
          <Text className="text-sm font-semibold text-foreground">
            {product.inventory_quantity}
          </Text>
        </View>
        {product.sale_price && (
          <View>
            <Text className="text-xs text-muted-foreground">Sale Price</Text>
            <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
              TShs {product.sale_price.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {(product?.validation_errors?.length || 0) > 0 && (
        <View className="bg-destructive/10 border border-destructive/20 rounded p-2 mb-2">
          {product?.validation_errors?.map((error, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <XCircle size={12} className="mr-1 mt-0.5" color={resolvedColors.destructive} />
              <Text className="text-xs text-destructive flex-1">{error}</Text>
            </View>
          ))}
        </View>
      )}

      {(product?.validation_warnings?.length || 0) > 0 && (
        <View className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded p-2">
          {product?.validation_warnings?.map((warning, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <AlertTriangle size={12} className="mr-1 mt-0.5" color={resolvedColors.warning} />
              <Text className="text-xs text-yellow-700 dark:text-yellow-300 flex-1">{warning}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Text className="font-semibold text-sm">View Details</Text>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-h-[90vh]" 
        style={Platform.OS === "web" ? { width: "75vw", minHeight: "70vh" } : { width: "100%" }}
      >
        <DialogHeader>
          <DialogTitle>Batch Details</DialogTitle>
        </DialogHeader>

        {isBatchLoading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color={resolvedColors.primary} />
            <Text className="text-muted-foreground mt-4">Loading batch details...</Text>
          </View>
        ) : !batch ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-destructive">Failed to load batch details</Text>
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            <View className="bg-muted rounded-lg p-4 mb-4">
              <Text className="text-sm font-semibold text-foreground mb-3">
                {batch.filename}
              </Text>
              <View className="flex-row gap-4 flex-wrap">
                <View>
                  <Text className="text-xs text-muted-foreground">Total</Text>
                  <Text className="text-lg font-bold text-foreground">{batch.total_products}</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground">Valid</Text>
                  <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                    {batch.valid_products}
                  </Text>
                </View>
                {batch.warning_products > 0 && (
                  <View>
                    <Text className="text-xs text-muted-foreground">Warnings</Text>
                    <Text className="text-lg font-bold text-warning">{batch.warning_products}</Text>
                  </View>
                )}
                {batch.invalid_products > 0 && (
                  <View>
                    <Text className="text-xs text-muted-foreground">Invalid</Text>
                    <Text className="text-lg font-bold text-destructive">
                      {batch.invalid_products}
                    </Text>
                  </View>
                )}
              </View>

              {batch.summary?.success_rate !== undefined && (
                <View className="mt-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs text-muted-foreground">Success Rate</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      {batch.summary.success_rate}%
                    </Text>
                  </View>
                  <View className="h-2 bg-background rounded-full overflow-hidden">
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
            </View>

            {/* Toggle Buttons */}
            <View className="flex-row gap-2 mb-3">
              <Button
                size="sm"
                variant={showProducts ? "primary" : "outline"}
                onPress={() => {
                  setShowProducts(true);
                  setShowErrors(false);
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    showProducts ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Products ({productsData?.total || 0})
                </Text>
              </Button>
              {((batch?.errors?.length || 0) > 0 || (batch?.warnings?.length || 0) > 0) && (
                <Button
                  size="sm"
                  variant={showErrors ? "primary" : "outline"}
                  onPress={() => {
                    setShowProducts(false);
                    setShowErrors(true);
                  }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      showErrors ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Issues ({(batch?.errors?.length || 0) + (batch?.warnings?.length || 0)})
                  </Text>
                </Button>
              )}
            </View>

            {/* Content Area */}
            <ScrollView className="flex-1 mb-4" style={{ maxHeight: 500 }}>
              {showProducts ? (
                isProductsLoading ? (
                  <View className="flex-1 justify-center items-center py-10">
                    <ActivityIndicator size="large" color={resolvedColors.primary} />
                  </View>
                ) : !productsData?.items || productsData.items.length === 0 ? (
                  <View className="flex-1 justify-center items-center py-10">
                    <Package size={48} color={resolvedColors.mutedForeground} />
                    <Text className="text-muted-foreground mt-4">No products found</Text>
                  </View>
                ) : (
                  <View>{productsData.items.map(renderProduct)}</View>
                )
              ) : showErrors ? (
                <View>
                  {(batch?.errors?.length || 0) > 0 && (
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-destructive mb-2">
                        Errors ({batch?.errors?.length || 0})
                      </Text>
                      {batch?.errors?.map((error, index) => (
                        <Card key={index} className="p-3 mb-2 border-l-4 border-l-destructive">
                          <View className="flex-row items-start">
                            <XCircle size={16} className="mr-2 mt-0.5" color={resolvedColors.destructive} />
                            <View className="flex-1">
                              {error.row_number && (
                                <Text className="text-xs text-muted-foreground mb-1">
                                  Row {error.row_number}
                                  {error.product_name && ` - ${error.product_name}`}
                                  {error.sku && ` (${error.sku})`}
                                </Text>
                              )}
                              <Text className="text-sm text-destructive">{error.message}</Text>
                              {error.field && (
                                <Text className="text-xs text-muted-foreground mt-1">
                                  Field: {error.field}
                                </Text>
                              )}
                            </View>
                          </View>
                        </Card>
                      ))}
                    </View>
                  )}

                  {(batch?.warnings?.length || 0) > 0 && (
                    <View>
                      <Text className="text-sm font-semibold text-warning mb-2">
                        Warnings ({batch?.warnings?.length || 0})
                      </Text>
                      {batch?.warnings?.map((warning, index) => (
                        <Card key={index} className="p-3 mb-2 border-l-4 border-l-warning">
                          <View className="flex-row items-start">
                            <AlertTriangle size={16} className="mr-2 mt-0.5" color={resolvedColors.warning} />
                            <View className="flex-1">
                              <Text className="text-xs text-muted-foreground mb-1">
                                Row {warning.row_number}
                                {warning.product_name && ` - ${warning.product_name}`}
                              </Text>
                              <Text className="text-sm text-warning">{warning.message}</Text>
                              {warning.field && (
                                <Text className="text-xs text-muted-foreground mt-1">
                                  Field: {warning.field}
                                </Text>
                              )}
                            </View>
                          </View>
                        </Card>
                      ))}
                    </View>
                  )}
                </View>
              ) : null}
            </ScrollView>

            {/* Action Buttons */}
            {isPending && (
              <DialogFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  onPress={handleReject}
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                  className="flex-1"
                >
                  {rejectMutation.isPending ? (
                    <ActivityIndicator size="small" color={resolvedColors.foreground} />
                  ) : (
                    <>
                      <XCircle size={16} className="mr-2" color={resolvedColors.destructive} />
                      <Text className="font-semibold text-destructive">Reject</Text>
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  onPress={handleApprove}
                  disabled={!canApprove || approveMutation.isPending || rejectMutation.isPending}
                  className="flex-1"
                >
                  {approveMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" color="white" />
                      <Text className="font-semibold text-white">Approve</Text>
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};


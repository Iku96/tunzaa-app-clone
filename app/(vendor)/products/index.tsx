import React, { useState, useMemo, useCallback } from "react";
import { View, ScrollView, Image, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import * as Burnt from "burnt";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Package,
  LayoutGrid
} from "lucide-react-native";
import {
  useGetProducts,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductInventory,
  useUpdateProductStatus,
  type ProductResponse,
} from "@/services/product-management";
import { ProductModal } from "@/components/modals/ProductModal";
import { InventoryModal } from "@/components/modals/InventoryModal";
import { BulkUploadModal } from "@/components/modals/BulkUploadModal";
import { BatchListModal } from "@/components/modals/BatchListModal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/Table";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import SidebarMenu from "@/src/components/merchant/SidebarMenu";

type Filters = {
  search: string;
  status: "all" | "in-stock" | "low-stock" | "out-of-stock";
};

export const ProductsScreen = () => {
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();
  const { user } = useTunzaaAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
  });
  const [refreshing, setRefreshing] = useState(false);

  const { vendorDetails, isLoading: isProfileLoading } = useProfileDetails();
  const VENDOR_ID = vendorDetails?.vendor_id;
  const STORE_ID = vendorDetails?.stores?.[0]?.store_id;

  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
    refetch,
  } = useGetProducts(
    {
      vendor_id: VENDOR_ID || "",
      limit: 100,
    },
    !!VENDOR_ID
  );
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateInventoryMutation = useUpdateProductInventory();
  const updateProductStatusMutation = useUpdateProductStatus();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  usePageTitle("Products");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const filteredProducts = useMemo(() => {
    if (!productsData?.items) return [];

    return productsData.items.filter((product) => {
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase());

      let matchesStatus = true;
      if (filters.status !== "all") {
        if (filters.status === "out-of-stock") {
          matchesStatus = product.inventory_quantity === 0;
        } else if (filters.status === "low-stock") {
          matchesStatus =
            product.inventory_quantity > 0 &&
            product.inventory_quantity <= product.low_stock_threshold;
        } else if (filters.status === "in-stock") {
          matchesStatus =
            product.inventory_quantity > product.low_stock_threshold;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [productsData?.items, filters]);

  const handleSearch = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status as Filters["status"] }));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);


  const handleProductSubmit = async (productData: any, product?: ProductResponse) => {
    try {
      if (product) {
        if (!VENDOR_ID || !STORE_ID) {
          Burnt.toast({
            title: "Error",
            message: "Vendor or store information is missing",
            preset: "error",
            haptic: "error",
            duration: 4,
            from: "top",
          });
          return;
        }

        await updateProductMutation.mutateAsync({
          productId: product.product_id,
          data: {
            ...product,
            ...productData,
            vendor_id: VENDOR_ID,
            store_id: STORE_ID,
          },
        });
        Burnt.toast({
          title: "Product Updated",
          message: "Product updated successfully",
          preset: "done",
          haptic: "success",
          duration: 3,
          from: "top",
        });
      } else {
        if (!VENDOR_ID || !STORE_ID) {
          Burnt.toast({
            title: "Error",
            message: "Vendor or store information is missing",
            preset: "error",
            haptic: "error",
            duration: 4,
            from: "top",
          });
          return;
        }

        const createData = {
          ...productData,
          vendor_id: VENDOR_ID,
          store_id: STORE_ID,
        };

        await createProductMutation.mutateAsync(createData);
        Burnt.toast({
          title: "Product Created",
          message: "Product created successfully",
          preset: "done",
          haptic: "success",
          duration: 3,
          from: "top",
        });
      }
      refetch();
    } catch (error: any) {
      console.error("Product submission error:", error);
      let errorMessage = product ? "Failed to update product" : "Failed to create product";
      if (error?.originalError?.response?.data?.detail) {
        errorMessage = error.originalError.response.data.detail;
      } else if (error?.apiError?.message) {
        errorMessage = error.apiError.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Burnt.toast({
        title: "Error",
        message: errorMessage,
        preset: "error",
        haptic: "error",
        duration: 5,
        from: "top",
      });
    }
  };

  const handleInventorySubmit = async (
    productId: string,
    newQuantity: number,
    basePrice?: number,
    salePrice?: number
  ) => {
    updateInventoryMutation.mutate(
      {
        productId,
        data: { inventory_quantity: newQuantity, base_price: basePrice, sale_price: salePrice },
      },
      {
        onSuccess: () => {
          Burnt.toast({
            title: "Inventory Updated",
            message: "Inventory updated successfully",
            preset: "done",
            haptic: "success",
            duration: 3,
            from: "top",
          });
          refetch();
        },
        onError: (error: any) => {
          let errorMessage = "Failed to update inventory";
          if (error?.originalError?.response?.data?.detail) {
            errorMessage = error.originalError.response.data.detail;
          } else if (error?.apiError?.message) {
            errorMessage = error.apiError.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          Burnt.toast({
            title: "Error",
            message: errorMessage,
            preset: "error",
            haptic: "error",
            duration: 5,
            from: "top",
          });
        },
      }
    );
  };

  const handleToggleVisibility = (product: ProductResponse) => {
    const newStatus = !product.is_active;
    const action = newStatus ? "activate" : "hide";
    const title = `${action.charAt(0).toUpperCase() + action.slice(1)} Product`;
    const message = `Are you sure you want to ${action} "${product.name}"? ${newStatus
      ? "This will make the product visible to customers."
      : "This will hide the product from customers."
      }`;

    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus ? "default" : "destructive",
          onPress: () => {
            updateProductStatusMutation.mutate(
              {
                productId: product.product_id,
                data: { is_active: newStatus },
              },
              {
                onSuccess: () => {
                  Burnt.toast({
                    title: newStatus ? "Product Activated" : "Product Hidden",
                    message: `Product ${action}d successfully`,
                    preset: "done",
                    haptic: "success",
                    duration: 3,
                    from: "top",
                  });
                  refetch();
                },
                onError: (error: any) => {
                  let errorMessage = `Failed to ${action} product`;
                  if (error?.originalError?.response?.data?.detail) {
                    errorMessage = error.originalError.response.data.detail;
                  } else if (error?.apiError?.message) {
                    errorMessage = error.apiError.message;
                  } else if (error?.message) {
                    errorMessage = error.message;
                  }
                  Burnt.toast({
                    title: "Error",
                    message: errorMessage,
                    preset: "error",
                    haptic: "error",
                    duration: 5,
                    from: "top",
                  });
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/(vendor)/products/${productId}`);
  };

  const productColumns = [
    {
      header: "Name",
      accessor: "name",
      render: (value: string, row: ProductResponse) => (
        <TouchableOpacity onPress={() => handleViewProduct(row.product_id)}>
          <Text className="text-foreground underline">{value}</Text>
        </TouchableOpacity>
      ),
    },
    {
      header: "SKU",
      accessor: "sku",
    },
    {
      header: "Price",
      accessor: "base_price",
      render: (value: number) => `TShs ${value.toLocaleString()}`,
    },
    {
      header: "Stock",
      accessor: "inventory_quantity",
      render: (value: number, row: ProductResponse) =>
        value === 0
          ? "Out of Stock"
          : value <= row.low_stock_threshold
            ? "Low Stock"
            : value.toString(),
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (value: boolean) => (value ? "Active" : "Hidden"),
    },
    {
      header: "Verification Status",
      accessor: "verification_status",
      render: (value: string) => value?.toUpperCase() || "",
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (_: any, product: ProductResponse) => (
        <View className="flex-row gap-2">
          <ProductModal
            product={product}
            onSubmit={(productData) => handleProductSubmit(productData, product)}
            triggerSize="icon"
            triggerVariant="primary"
          />
          <InventoryModal
            triggerVariant="outline"
            product={product}
            onSubmit={handleInventorySubmit}
            triggerSize="icon"
          />
          <Button
            variant="outline"
            size="icon"
            onPress={() => handleToggleVisibility(product)}
          >
            {product.is_active ? (
              <Eye size={16} className="text-foreground" color={resolvedColors.foreground} />
            ) : (
              <EyeOff size={16} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
            )}
          </Button>
        </View>
      ),
    },
  ];

  const totalInventory =
    filteredProducts.reduce((sum, product) => sum + (product.inventory_quantity || 0), 0) || 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <SidebarMenu isVisible={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
            <LayoutGrid size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={{ width: 44 }} />
      </View>

      <DesktopLayoutWrapper
        showSidebar={false}
        showSecondaryNav={false}
        showNavBar={true}
        showFooter={true}
        containerClassName="bg-muted"
      >
        <View className={`flex-1 bg-background ${isDesktop ? "px-16 py-10" : "p-0"}`}>
          {isDesktop ? (
            // Desktop Layout
            <View className="flex-1">
              <View className="mb-6 flex-row justify-between items-center">
                <Input
                  value={filters.search}
                  onChangeText={handleSearch}
                  placeholder="Search products..."
                  className="w-80"
                />
                <View className="flex-row gap-3">
                  {VENDOR_ID && STORE_ID && (
                    <>
                      <BulkUploadModal
                        vendorId={VENDOR_ID}
                        storeId={STORE_ID}
                        onUploadSuccess={() => refetch()}
                        triggerVariant="outline"
                        triggerSize="lg"
                      />
                      <BatchListModal
                        vendorId={VENDOR_ID}
                        triggerVariant="outline"
                        triggerSize="lg"
                        onBatchAction={() => refetch()}
                      />
                    </>
                  )}
                  <ProductModal
                    onSubmit={(productData) => handleProductSubmit(productData)}
                    disabled={!VENDOR_ID || !STORE_ID}
                    triggerSize="lg"
                    triggerVariant="primary"
                  />
                </View>
              </View>
              <View className="mb-6">
                <View className="flex-row gap-3 flex-wrap">
                  {["all", "in-stock", "low-stock", "out-of-stock"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={filters.status === status ? "primary" : "outline"}
                      onPress={() => handleStatusFilter(status)}
                    >
                      <Text
                        className={`text-sm font-semibold ${filters.status === status
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                          }`}
                      >
                        {status
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Text>
                    </Button>
                  ))}
                </View>
              </View>
              {!vendorDetails ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-muted-foreground text-lg">
                    {isProfileLoading
                      ? "Loading profile..."
                      : "No vendor details available."}
                  </Text>
                </View>
              ) : isProductsLoading ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-muted-foreground text-lg">Loading products...</Text>
                </View>
              ) : productsError ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-destructive mb-4 text-lg">Failed to load products</Text>
                  <Button onPress={() => refetch()}>
                    <Text className="text-white font-semibold">Retry</Text>
                  </Button>
                </View>
              ) : filteredProducts.length === 0 ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-muted-foreground text-lg">No products found</Text>
                </View>
              ) : (
                <Table
                  columns={productColumns}
                  data={filteredProducts}
                  footer={{ label: "Total Inventory", value: totalInventory.toString() }}
                  ariaLabelledBy="products-table"
                />
              )}
            </View>
          ) : (
            // Mobile Layout
            <View className="flex-1 bg-background">
              <View className="p-4 border-b border-border">
                {vendorDetails && (
                  <Text className="text-sm text-muted-foreground mb-3">
                    {vendorDetails.business_name || vendorDetails.display_name}
                  </Text>
                )}
                <View className="flex-row justify-end gap-2 flex-wrap">
                  {VENDOR_ID && STORE_ID && (
                    <>
                      <BulkUploadModal
                        vendorId={VENDOR_ID}
                        storeId={STORE_ID}
                        onUploadSuccess={() => refetch()}
                        triggerVariant="outline"
                        triggerSize="sm"
                      />
                      <BatchListModal
                        vendorId={VENDOR_ID}
                        triggerVariant="outline"
                        triggerSize="sm"
                        onBatchAction={() => refetch()}
                      />
                    </>
                  )}
                  <ProductModal
                    onSubmit={(productData) => handleProductSubmit(productData)}
                    disabled={!VENDOR_ID || !STORE_ID}
                  />
                </View>
              </View>
              <View className="px-4 py-3 border-b border-border">
                <Input
                  value={filters.search}
                  onChangeText={handleSearch}
                  placeholder="Search products..."
                  className="mb-3"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {["all", "in-stock", "low-stock", "out-of-stock"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={filters.status === status ? "primary" : "outline"}
                        onPress={() => handleStatusFilter(status)}
                        className={filters.status === status ? "bg-primary" : ""}
                      >
                        <Text
                          className={`text-sm font-semibold ${filters.status === status
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                            }`}
                        >
                          {status
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Text>
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
              >
                <ScrollView
                  className="flex-1 px-4 py-4"
                  keyboardShouldPersistTaps="handled"
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={resolvedColors.primary}
                      colors={[resolvedColors.primary]}
                    />
                  }
                >
                  {!vendorDetails ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-muted-foreground">
                        {isProfileLoading
                          ? t("vendor.products.loading_profile")
                          : t("vendor.products.no_vendor_details")}
                      </Text>
                    </View>
                  ) : isProductsLoading && !refreshing ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-muted-foreground">{t("vendor.products.loading")}</Text>
                    </View>
                  ) : productsError ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-destructive mb-4">{t("vendor.products.failed_to_load")}</Text>
                      <Button variant="outline" onPress={() => refetch()}>
                        <Text className="text-white font-semibold">{t("vendor.products.retry")}</Text>
                      </Button>
                    </View>
                  ) : filteredProducts.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-muted-foreground">{t("vendor.products.no_products")}</Text>
                    </View>
                  ) : (
                    filteredProducts.map((product) => (
                      <Card
                        key={product.product_id}
                        className={`mb-3 p-3 ${!product.is_active ? "opacity-60" : ""}`}
                      >
                        <TouchableOpacity
                          className="flex-row"
                          onPress={() => handleViewProduct(product.product_id)}
                        >
                          <View className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center relative">
                            {product.images.length > 0 &&
                              typeof product.images[0] === "object" &&
                              "url" in product.images[0] ? (
                              <Image
                                source={{ uri: product.images[0].url }}
                                className="w-20 h-20 rounded-lg"
                              />
                            ) : (
                              <Package size={24} className="text-muted-foreground" />
                            )}
                            {!product.is_active && (
                              <View className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                <EyeOff size={16} color="white" />
                              </View>
                            )}
                          </View>
                          <View className="flex-1 ml-3">
                            <View className="flex-row items-center justify-between mb-1">
                              <Text className="text-base font-semibold text-foreground flex-1">
                                {product.name}
                              </Text>
                              {!product.is_active && (
                                <Badge variant="secondary" className="ml-2">
                                  <Text className="text-xs">{t("vendor.products.hidden")}</Text>
                                </Badge>
                              )}
                              {product.verification_status && (
                                <Badge variant="outline" className="ml-2">
                                  <Text className="text-xs">{product.verification_status.toUpperCase()}</Text>
                                </Badge>
                              )}
                            </View>
                            <Text className="text-sm text-muted-foreground mb-3">
                              {product.sku}
                            </Text>
                            <View className="flex-row gap-6 mb-3">
                              <View>
                                <Text className="text-xs text-muted-foreground">{t("vendor.products.price")}</Text>
                                <Text className="text-sm font-semibold text-foreground">
                                  TShs {(product.sale_price || product.base_price).toLocaleString()}
                                </Text>
                              </View>
                              <View>
                                <Text className="text-xs text-muted-foreground">{t("vendor.products.stock")}</Text>
                                <Text
                                  className={`text-sm font-semibold ${product.inventory_quantity === 0
                                    ? "text-destructive"
                                    : product.inventory_quantity <= product.low_stock_threshold
                                      ? "text-warning"
                                      : "text-foreground"
                                    }`}
                                >
                                  {product.inventory_quantity}
                                </Text>
                              </View>
                            </View>
                            <View className="flex-row gap-2">
                              <ProductModal
                                product={product}
                                onSubmit={(productData) => handleProductSubmit(productData, product)}
                                triggerSize="icon"
                                triggerVariant="primary"
                              />
                              <InventoryModal
                                triggerVariant="outline"
                                product={product}
                                onSubmit={handleInventorySubmit}
                                triggerSize="icon"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onPress={() => handleToggleVisibility(product)}
                              >
                                {product.is_active ? (
                                  <Eye size={16} className="text-foreground" color={resolvedColors.foreground} />
                                ) : (
                                  <EyeOff size={16} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
                                )}
                              </Button>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Card>
                    ))
                  )}
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          )}
        </View>
      </DesktopLayoutWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  }
});

export default ProductsScreen;
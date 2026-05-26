import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { View, FlatList, Alert, RefreshControl, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  type Option,
} from "@/components/ui/select";
import {
  useGetVendorOrders,
  useUpdateOrderStatus,
} from "@/services/order-management";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { OrderCard } from "./OrderCard";
import { OrderDetails } from "@/components/orders/VendorOrderDetails";
import type { Order } from "@/services/types/orders";
import { useAuth } from "@/context/auth";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";
import { Eye, Package, Search } from "lucide-react-native";

export const VendorOrders = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Option>({
    value: "processing",
    label: t("orders.paid_awaiting_processing"),
  });
  // Payment filter commented out as per requirement
  const [paymentFilter, setPaymentFilter] = useState<Option>({
    value: "all",
    label: t("orders.all_payments"),
  });
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();
  const { vendorDetails } = useProfileDetails();
  const VENDOR_ID = vendorDetails?.vendor_id;
  usePageTitle("Orders");

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetVendorOrders(
    {
      vendor_id: VENDOR_ID || "",
      limit: 100,
      status: statusFilter?.value !== "all" ? statusFilter?.value : undefined,
      payment_status: paymentFilter?.value !== "all" ? paymentFilter?.value : undefined,
    },
    !!VENDOR_ID
  );

  const updateOrderStatusMutation = useUpdateOrderStatus();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleStatusSubmit = async (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate(
      {
        orderId,
        data: { status: newStatus as any },
      },
      {
        onSuccess: () => {
          Alert.alert(t("common.success"), t("vendor.orders.order_status_updated"));
          refetch();
        },
        onError: () => {
          Alert.alert(t("common.error"), t("vendor.orders.failed_to_update_status"));
        },
      }
    );
  };

  const ordersArray = ordersData?.items || [];
  const filteredOrders = ordersArray.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter({ value: "processing", label: t("orders.paid_awaiting_processing") });
    setPaymentFilter({ value: "all", label: t("orders.all_payments") });
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter?.value !== "all" ||
    paymentFilter?.value !== "all";

  const getStatusVariant = (
    status: string
  ): "success" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "success";
      case "pending":
      case "processing":
      case "confirmed":
        return "outline";
      case "cancelled":
      case "failed":
        return "destructive";
      case "refunded":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "TZS") => {
    if (currency === "TZS") {
      return `TSh ${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const renderOrderCard = ({ item: order }: { item: Order }) => (
    <View className="mb-4">
      <OrderCard
        order={order}
        onStatusUpdate={() => { }}
        onPress={() => isDesktop ? setSelectedOrderId(order.order_id) : router.push(`/orders/${order.order_id}`)}
      />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Package size={64} className="text-muted-foreground mb-4" color={resolvedColors.primary} />
      <Text className="text-lg font-semibold text-foreground mb-2">
        {hasActiveFilters
          ? t("orders.try_adjusting_filters")
          : t("vendor.orders.no_orders_found")}
      </Text>
      {hasActiveFilters && (
        <Button variant="outline" onPress={resetFilters} className="mt-4">
          <Text>Reset Filters</Text>
        </Button>
      )}
    </View>
  );

  // Table Loading Skeleton (only table part)
  const TableLoadingSkeleton = () => (
    <View className="w-full bg-white rounded-lg border border-border overflow-hidden">
      <View className="flex-row bg-muted border-b border-border py-3 px-4">
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Order
        </Text>
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Date
        </Text>
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Customer
        </Text>
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Payment
        </Text>
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Total
        </Text>
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Items
        </Text>
        <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
          Status
        </Text>
        <Text className="w-32 text-xs font-semibold text-muted-foreground uppercase">
          Action
        </Text>
      </View>

      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <View key={i} className="flex-row items-center border-b border-border py-4 px-4">
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="flex-1 h-4 bg-muted rounded mr-4" />
          <View className="w-32 h-4 bg-muted rounded" />
        </View>
      ))}
    </View>
  );

  // Initial Desktop Loading (full page)
  if (isLoading && !ordersData && isDesktop) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showSecondaryNav={false}
        showNavBar={true}
        showFooter={true}
        containerClassName="bg-muted"
      >
        <View className="flex-1 bg-background mx-16 py-4">
          <View className="w-full bg-background p-6">
            {/* Header Skeleton */}
            <View className="mb-6">
              <View className="h-9 w-48 bg-muted rounded mb-6" />

              <View className="flex-row items-center justify-between gap-4 mb-4">
                <View className="w-96 h-10 bg-muted rounded" />
                <View className="flex-row gap-3">
                  <View className="w-48 h-10 bg-muted rounded" />
                  <View className="w-48 h-10 bg-muted rounded" />
                </View>
              </View>

              <View className="h-5 w-64 bg-muted rounded" />
            </View>

            {/* Table Skeleton */}
            <TableLoadingSkeleton />
          </View>
        </View>
      </DesktopLayoutWrapper>
    );
  }

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "processing", label: t("orders.paid_awaiting_processing") },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const renderStatusTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row mb-4"
      contentContainerStyle={{ gap: 8, paddingRight: 16 }}
    >
      {statusOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => setStatusFilter(option)}
          className={`px-4 py-2 rounded-full border ${statusFilter?.value === option.value
            ? "bg-primary border-primary"
            : "bg-background border-border"
            }`}
        >
          <Text
            className={`text-sm font-medium ${statusFilter?.value === option.value
              ? "text-secondary-foreground"
              : "text-foreground"
              }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showSecondaryNav={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      {isDesktop ? (
        // Desktop Table Layout
        <View className="flex-1 bg-background py-4">
          <View className="w-full bg-background p-6">
            {/* Header with Filters - Always visible */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-foreground mb-6">
                Vendor Orders
              </Text>

              <View className="flex-row items-center justify-between gap-4 mb-4">
                <View className="w-96">
                  <Input
                    placeholder="Search by order number..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="border border-border"
                  />
                </View>
              </View>

              {/* Status Tabs */}
              {renderStatusTabs()}

              {/* Payment Filter (Hidden) */}
              {/* <View className="w-48">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="text-foreground bg-muted">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" label="All Payments" />
                    <SelectItem value="pending" label="Pending" />
                    <SelectItem value="paid" label="Paid" />
                    <SelectItem value="failed" label="Failed" />
                    <SelectItem value="refunded" label="Refunded" />
                  </SelectContent>
                </Select>
              </View> */}

              <View className="flex-row items-center gap-3 mt-2">
                <Text className="text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? `Showing filtered results (${filteredOrders.length} orders)`
                    : `${t("orders.start_shopping")}(${ordersArray.length} total)`
                  }
                </Text>
                {isFetching && (
                  <ActivityIndicator size="small" color={resolvedColors.primary} />
                )}
              </View>
            </View>

            {/* Orders Table - Show loading skeleton when filtering/searching */}
            {isFetching && !ordersData ? (
              <TableLoadingSkeleton />
            ) : (
              <View className="w-full bg-white rounded-lg border border-border overflow-hidden">
                {/* Table Header */}
                <View className="flex-row bg-muted border-b border-border py-3 px-4">
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Order
                  </Text>
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </Text>
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Customer
                  </Text>
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Payment
                  </Text>
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Total
                  </Text>
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Items
                  </Text>
                  <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </Text>
                  <Text className="w-32 text-xs font-semibold text-muted-foreground uppercase">
                    Action
                  </Text>
                </View>

                {/* Table Body */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="max-h-[600px]"
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor="#666"
                    />
                  }
                >
                  {error ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-destructive mb-4">Failed to load orders</Text>
                      <Button onPress={() => refetch()}>
                        <Text className="text-white font-semibold">Retry</Text>
                      </Button>
                    </View>
                  ) : filteredOrders.length === 0 ? (
                    renderEmpty()
                  ) : (
                    filteredOrders.map((order: Order) => {
                      if (!order || !order.order_id || !order.totals) {
                        return null;
                      }

                      return (
                        <View
                          key={order.order_id}
                          className="flex-row items-center border-b border-border py-4 px-4 hover:bg-muted/50"
                        >
                          {/* Order Number */}
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-foreground">
                              #{order.order_number}
                            </Text>
                          </View>

                          {/* Date */}
                          <View className="flex-1">
                            <Text className="text-sm text-foreground">
                              {formatDate(order.created_at)}
                            </Text>
                          </View>

                          {/* Customer */}
                          <View className="flex-1">
                            <Text className="text-sm text-foreground">
                              {order.shipping_address?.first_name || "N/A"} {order.shipping_address?.last_name || ""}
                            </Text>
                          </View>

                          {/* Payment Status */}
                          <View className="flex-1">
                            <View className="inline-flex self-start">
                              <Badge
                                variant={
                                  order.payment_status.toLowerCase() === "paid"
                                    ? "success"
                                    : order.payment_status.toLowerCase() === "failed"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                <Text className="text-xs capitalize">
                                  {order.payment_status}
                                </Text>
                              </Badge>
                            </View>
                          </View>

                          {/* Total */}
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-foreground">
                              {formatCurrency(order.totals.total, order.currency)}
                            </Text>
                          </View>

                          {/* Items Count */}
                          <View className="flex-1">
                            <Text className="text-sm text-foreground">
                              {order.items?.length || 0} items
                            </Text>
                          </View>

                          {/* Order Status */}
                          <View className="flex-1">
                            <View className="inline-flex self-start">
                              <Badge variant={getStatusVariant(order.status)}>
                                <Text className="text-xs capitalize">
                                  {order.status}
                                </Text>
                              </Badge>
                            </View>
                          </View>

                          {/* Actions */}
                          <View className="w-32 flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => router.push(`/orders/${order.order_id}`)}
                              className="p-2 rounded hover:bg-muted"
                            >
                              <Eye size={18} className="text-foreground" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      ) : (
        // Mobile Layout (Original)
        <View className="flex-1 bg-background p-2">
          <View className="p-2 border-b border-border mb-4">
            <Text className="text-2xl font-bold text-foreground mb-4">Orders</Text>

            {/* Mobile Filters */}
            <View className="gap-4">
              <Input
                placeholder="Search by order number..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="border border-border"
              />

              {/* Status Tabs */}
              {renderStatusTabs()}

              {/* Payment Filter (Hidden) */}
              {/* <View className="flex-1">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="text-foreground bg-muted">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" label="All Payments" />
                    <SelectItem value="pending" label="Pending" />
                    <SelectItem value="paid" label="Paid" />
                    <SelectItem value="failed" label="Failed" />
                    <SelectItem value="refunded" label="Refunded" />
                  </SelectContent>
                </Select>
              </View> */}

              {hasActiveFilters && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">
                    {filteredOrders.length} orders found
                  </Text>
                  <Button variant="outline" onPress={resetFilters}>
                    <Text>Reset Filters</Text>
                  </Button>
                </View>
              )}
            </View>
          </View>

          {error ? (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-destructive mb-4">Failed to load orders</Text>
              <Button onPress={() => refetch()}>
                <Text className="text-white font-semibold">Retry</Text>
              </Button>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.order_id}
              contentContainerStyle={{ padding: 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[resolvedColors.primary]}
                  tintColor={resolvedColors.primary}
                />
              }
              ListEmptyComponent={!isLoading ? renderEmpty : null}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </DesktopLayoutWrapper>
  );
};
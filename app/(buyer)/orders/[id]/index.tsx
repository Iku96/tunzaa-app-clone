import React, { useCallback, useState } from "react";
import { View, ScrollView, RefreshControl, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  AlertCircle,
  Star,
  Share2,
  MessageSquare,
  Truck,
  CheckCircle,
  Clock,
  User,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useGetOrder, useGetOrderByNumber, useGetOrderTransactions } from "@/services/orders";
import { useCheckPaymentStatus } from "@/services/payments";
import { useGetDeliveryByOrderId, useGetDeliveryPartner } from "@/services/delivery";
import { useCreateTicket } from "@/services/support";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useGetUserRating, formatRating, getRatingColor } from "@/services/ratings";
import { useI18n } from "@/hooks/useI18n";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Modal } from "react-native";
import { Terminal } from "@/lib/icons/Terminal";
import { OrderDetailsSkeleton } from "@/components/ui/skeleton";
import { OrderRatingsModal } from "@/components/modals/OrderRatingsModal";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { DeliveryTimeline } from "@/components/orders/DeliveryTimeline";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { useTenantModules } from "@/hooks/useTenantModules";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import * as Burnt from "burnt";

interface TicketFormData {
  subject: string;
  initial_message: string;
  category: string;
  priority: string;
  vendor_id: string;
  order_id: string;
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const { isDeliveryEnabled, isPaymentsEnabled } = useTenantModules();
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTicketMutation = useCreateTicket();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();

  const [ticketForm, setTicketForm] = useState<TicketFormData>({
    subject: "",
    initial_message: "",
    category: "order",
    priority: "medium",
    vendor_id: "",
    order_id: "",
  });

  // Determine if the id is an order number or order ID
  const isOrderNumber = React.useMemo(() => {
    return typeof id === 'string' && id.startsWith('ORD-');
  }, [id]);

  const orderByIdResult = useGetOrder(
    id as string,
    !!id && !isOrderNumber
  );

  const orderByNumberResult = useGetOrderByNumber(
    id as string,
    !!id && isOrderNumber
  );

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = isOrderNumber ? orderByNumberResult : orderByIdResult;

  const orderId = React.useMemo(() => {
    return order?.order_id || (isOrderNumber ? undefined : (id as string));
  }, [order, id, isOrderNumber]);

  const orderNumber = React.useMemo(() => {
    return order?.order_number || (isOrderNumber ? (id as string) : undefined);
  }, [order, id, isOrderNumber]);

  // Fetch transactions to get the transaction ID for payment status check
  const { data: transactionsData } = useGetOrderTransactions(
    orderNumber || "",
    !!orderNumber && (order?.payment_status?.toLowerCase() === "pending" || order?.payment_status?.toLowerCase() === "processing")
  );

  const transactionId = React.useMemo(() => {
    if (transactionsData?.data && transactionsData.data.length > 0) {
      return transactionsData.data[0].transaction_id;
    }
    return order?.payment_details?.transaction_id;
  }, [transactionsData, order]);

  // Poll payment status if order is pending and we have a transaction ID
  const { data: paymentStatusData } = useCheckPaymentStatus(
    transactionId || "",
    !!transactionId && (order?.payment_status?.toLowerCase() === "pending" || order?.payment_status?.toLowerCase() === "processing")
  );

  const queryClient = useQueryClient();

  // Invalidate order query if payment status changes to completed
  React.useEffect(() => {
    if (paymentStatusData?.data?.status === "COMPLETED") {
      if (order?.payment_status?.toLowerCase() !== "paid" && order?.payment_status?.toLowerCase() !== "completed") {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({ queryKey: ["order-by-number", orderNumber] });
        refetch();
      }
    }
  }, [paymentStatusData, order, queryClient, orderId, orderNumber, refetch]);

  const {
    data: delivery,
    isLoading: deliveryLoading,
    refetch: refetchDelivery,
  } = useGetDeliveryByOrderId(orderId || '', !!orderId);

  const partnerId = React.useMemo(() => {
    if (!delivery?.stages || delivery.stages.length === 0) return null;
    return delivery.stages[0].partner_id;
  }, [delivery?.stages]);

  const {
    data: deliveryPartner,
    isLoading: partnerLoading,
    refetch: refetchPartner,
  } = useGetDeliveryPartner(partnerId || '', !!partnerId);

  const productIds = React.useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];
    return order.items
      .map(item => item?.product_id)
      .filter(Boolean)
      .filter(id => typeof id === 'string');
  }, [order?.items]);

  const {
    getProductImage,
    isLoading: productsLoading,
    hasError: productsError,
  } = useProductDetails(productIds);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
        if (orderId) {
          refetchDelivery();
        }
        if (partnerId) {
          refetchPartner();
        }
      }
    }, [id, refetch, refetchDelivery, orderId, partnerId, refetchPartner])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const promises: Promise<any>[] = [refetch()];
      if (orderId) {
        promises.push(refetchDelivery());
      }
      if (partnerId) {
        promises.push(refetchPartner());
      }
      await Promise.all(promises);
    } catch (error) {
      console.error("Error refreshing order:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchDelivery, orderId, partnerId, refetchPartner]);

  const groupedItems = React.useMemo(() => {
    if (!order?.items) return {};

    return order.items.reduce((groups, item) => {
      const storeId = item.store_id || 'unknown';
      if (!groups[storeId]) {
        groups[storeId] = {
          store_id: storeId,
          store_name: item.store?.store_name || 'Unknown Store',
          items: []
        };
      }
      groups[storeId].items.push(item);
      return groups;
    }, {} as Record<string, { store_id: string; store_name: string; items: any[] }>);
  }, [order?.items]);

  const ratingsAllowed = React.useMemo(() => {
    return (
      order?.payment_status.toLowerCase() === 'paid' &&
      delivery?.current_stage?.toLowerCase() === 'delivered' || order?.status.toLowerCase() === 'completed'
    );
  }, [order?.payment_status, delivery?.current_stage]);

  const deliveryTimeline = React.useMemo(() => {
    if (!delivery?.stages) return [];

    return delivery.stages.map((stage, index) => ({
      stage: stage.stage,
      timestamp: stage.timestamp,
      location: stage.location && typeof stage.location === 'object' && 'lat' in stage.location && 'lng' in stage.location
        ? { lat: stage.location.lat, lng: stage.location.lng }
        : undefined,
      proof: (stage as any).proof || null,
      isLatest: index === delivery.stages.length - 1
    }));
  }, [delivery?.stages]);

  const getStatusVariant = (
    status: string
  ): "success" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "success";
      case "pending":
      case "processing":
        return "secondary";
      case "cancelled":
      case "failed":
        return "destructive";
      case "confirmed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "#22c55e";
      case "pending":
      case "processing":
        return "#eab308";
      case "cancelled":
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCompletePayment = () => {
    if (!order) return;
    router.push({
      pathname: "/(buyer)/payment",
      params: {
        orderId: order.order_id,
        paymentMethod: order.payment_details.method || "mobile_money",
        returnTo: "orders",
      },
    });
  };

  const handleShareOrder = async () => {
    // Implementation
  };

  const handleOpenTicketDialog = () => {
    if (!order) return;

    const firstVendorId = order.items && order.items.length > 0
      ? order.items[0].vendor_id
      : "";

    setTicketForm({
      subject: "",
      initial_message: "",
      category: "order",
      priority: "medium",
      vendor_id: firstVendorId,
      order_id: order.order_id,
    });
    setShowTicketDialog(true);
  };

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.initial_message.trim()) {
      Burnt.toast({
        title: "Invalid input",
        preset: "error",
        message: "Please fill in both subject and message",
        haptic: "error",
        duration: 3,
        from: "top",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicketMutation.mutateAsync(ticketForm);
      Burnt.toast({
        title: "Ticket Created",
        preset: "done",
        message: "Your support ticket has been successfully created",
        haptic: "success",
        duration: 2,
        from: "top",
      });
      setShowTicketDialog(false);
      setTicketForm({
        subject: "",
        initial_message: "",
        category: "order",
        priority: "medium",
        vendor_id: "",
        order_id: "",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      Burnt.toast({
        title: "Error creating ticket",
        preset: "error",
        message: "Failed to create ticket. Please try again.",
        haptic: "error",
        duration: 3,
        from: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desktop Skeleton Loader
  if (isLoading && isDesktop) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={false}
        containerClassName="bg-white"
      >
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          <View className="w-full bg-background p-6">
            {/* Header Skeleton */}
            <View className="flex-row items-center justify-between mb-6 pb-4 border-b border-border">
              <View className="h-8 w-64 bg-muted rounded" />
              <View className="flex-row gap-3">
                <View className="h-10 w-32 bg-muted rounded" />
                <View className="h-10 w-10 bg-muted rounded" />
              </View>
            </View>

            {/* Two Column Layout Skeleton */}
            <View className="flex-row gap-6">
              {/* Left Column */}
              <View className="flex-1">
                <View className="bg-white rounded-lg border border-border p-6 mb-6">
                  <View className="h-6 w-48 bg-muted rounded mb-4" />
                  <View className="h-4 w-full bg-muted rounded mb-2" />
                  <View className="h-4 w-3/4 bg-muted rounded" />
                </View>

                {[1, 2, 3].map((i) => (
                  <View key={i} className="bg-white rounded-lg border border-border p-6 mb-6">
                    <View className="h-5 w-40 bg-muted rounded mb-4" />
                    <View className="space-y-3">
                      <View className="h-4 w-full bg-muted rounded" />
                      <View className="h-4 w-full bg-muted rounded" />
                      <View className="h-4 w-2/3 bg-muted rounded" />
                    </View>
                  </View>
                ))}
              </View>

              {/* Right Column */}
              <View className="w-96">
                {[1, 2, 3].map((i) => (
                  <View key={i} className="bg-white rounded-lg border border-border p-6 mb-6">
                    <View className="h-5 w-32 bg-muted rounded mb-4" />
                    <View className="space-y-2">
                      <View className="h-4 w-full bg-muted rounded" />
                      <View className="h-4 w-full bg-muted rounded" />
                      <View className="h-4 w-1/2 bg-muted rounded" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </DesktopLayoutWrapper>
    );
  }

  // Mobile Loading
  if (isLoading && !isDesktop) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <OrderDetailsSkeleton />
      </SafeAreaView>
    );
  }

  // Error State
  if (!order || isError) {
    const ErrorContent = (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Order not found
          </Text>
          <View className="w-6" />
        </View>
        <View className="p-4">
          <Alert icon={Terminal} variant="destructive">
            <Text className="text-sm text-destructive">
              Failed to load order details. Please try again.
            </Text>
          </Alert>
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="mt-4"
          >
            <Text>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );

    return isDesktop ? (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={false}
        containerClassName="bg-white"
      >
        {ErrorContent}
      </DesktopLayoutWrapper>
    ) : ErrorContent;
  }

  // Desktop Layout
  if (isDesktop) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={false}
        containerClassName="bg-white"
      >
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 pb-4 border-b border-border">
            <View className="flex-row items-center gap-4">
              {/* <Button variant="ghost" size="icon" onPress={() => router.back()}>
                <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
              </Button> */}
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  Order #{order.order_number}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Placed on {formatDate(order.created_at)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              {order.payment_status.toLowerCase() === "pending" && isPaymentsEnabled && (
                <Button
                  variant="default"
                  onPress={handleCompletePayment}
                  className="bg-warning"
                >
                  <Text className="text-white font-semibold">
                    Complete Payment
                  </Text>
                </Button>
              )}
              <Button
                variant="outline"
                onPress={handleOpenTicketDialog}
              >
                <MessageSquare size={18} className="mr-2" color={resolvedColors.foreground} />
                <Text>Raise Ticket</Text>
              </Button>
              <Button variant="ghost" size="icon" onPress={handleShareOrder}>
                <Share2 size={20} className="text-foreground" color={resolvedColors.foreground} />
              </Button>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="p-6">
              {/* Two Column Layout */}
              <View className="flex-row gap-6">
                {/* Left Column - Main Content */}
                <View className="flex-1">
                  {/* Order Status Banner */}
                  <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className={`w-12 h-12 rounded-full items-center justify-center`} style={{ backgroundColor: getStatusColor(order.status) + '20' }}>
                          {order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered' ? (
                            <CheckCircle size={24} color={getStatusColor(order.status)} />
                          ) : order.status.toLowerCase() === 'processing' ? (
                            <Clock size={24} color={getStatusColor(order.status)} />
                          ) : (
                            <Package size={24} color={getStatusColor(order.status)} />
                          )}
                        </View>
                        <View>
                          <Text className="text-lg font-semibold text-foreground capitalize">
                            {order.status}
                          </Text>
                          <Text className="text-sm text-muted-foreground">
                            Order Status
                          </Text>
                        </View>
                      </View>

                      <View className="items-end">
                        <Text className="text-2xl font-bold text-success">
                          TShs {order.totals.total.toLocaleString()}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Total Amount
                        </Text>
                      </View>
                    </View>
                  </Card>

                  {/* Order Timeline */}
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Order Progress
                    </Text>
                    <OrderTimeline
                      orderStatus={order.status as any}
                      paymentStatus={order.payment_status as any}
                      userRole="buyer"
                      createdAt={order.created_at}
                      paidAt={order.paid_at || undefined}
                      fulfilledAt={order.fulfilled_at || undefined}
                      cancelledAt={order.cancelled_at || undefined}
                      collapsible={false}
                      defaultExpanded={true}
                    />
                  </Card>

                  {/* Order Items */}
                  {Object.values(groupedItems).map((storeGroup) => (
                    <Card key={storeGroup.store_id} className="mb-6 p-6">
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                          <Package size={20} className="text-primary" color={resolvedColors.primary} />
                          <View>
                            <Text className="text-lg font-semibold text-foreground">
                              {storeGroup.store_name}
                            </Text>
                            <Text className="text-sm text-muted-foreground">
                              {storeGroup.items.length} item{storeGroup.items.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                        {ratingsAllowed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => setShowRatingsModal(true)}
                          >
                            <Star size={16} className="mr-2" color={resolvedColors.foreground} />
                            <Text>Rate</Text>
                          </Button>
                        )}
                      </View>

                      <Separator className="my-4" />

                      {storeGroup.items.map((item, index) => {
                        const productImage = item?.product_id ? getProductImage(item.product_id) : null;

                        return (
                          <View key={item.item_id}>
                            <View className="flex-row items-center py-4">
                              <View className="w-20 h-20 rounded-lg bg-muted mr-4 overflow-hidden">
                                {productImage ? (
                                  <Image
                                    source={{ uri: productImage }}
                                    className="w-full h-full"
                                    style={{ resizeMode: 'cover' }}
                                  />
                                ) : (
                                  <View className="w-full h-full flex items-center justify-center">
                                    <Package size={24} className="text-muted-foreground" />
                                  </View>
                                )}
                              </View>

                              <View className="flex-1">
                                <Text className="text-base font-semibold text-foreground mb-1">
                                  {item.name}
                                </Text>
                                <Text className="text-sm text-muted-foreground mb-1">
                                  SKU: {item.sku}
                                </Text>
                                <Text className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × TShs {item.unit_price.toLocaleString()}
                                </Text>
                              </View>

                              <Text className="text-lg font-semibold text-foreground">
                                TShs {item.total.toLocaleString()}
                              </Text>
                            </View>
                            {index < storeGroup.items.length - 1 && <Separator />}
                          </View>
                        );
                      })}
                    </Card>
                  ))}

                  {/* Delivery Timeline - only show if delivery enabled */}
                  {isDeliveryEnabled && delivery && (
                    <Card className="mb-6 p-6">
                      <View className="flex-row items-center gap-3 mb-4">
                        <Truck size={20} className="text-primary" color={resolvedColors.primary} />
                        <Text className="text-lg font-semibold text-foreground">
                          Delivery Tracking
                        </Text>
                      </View>
                      <DeliveryTimeline
                        timeline={deliveryTimeline}
                        currentStage={delivery.current_stage}
                        estimatedDelivery={delivery.estimated_delivery_time || undefined}
                        actualDelivery={(delivery as any).actual_delivery_time}
                        partnerType={deliveryPartner?.type || 'individual'}
                        collapsible={false}
                        defaultExpanded={true}
                      />
                    </Card>
                  )}
                </View>

                {/* Right Column - Sidebar */}
                <View className="w-96">
                  {/* Payment Summary */}
                  <Card className="mb-6 p-6">
                    <View className="flex-row items-center gap-3 mb-4">
                      <CreditCard size={20} className="text-primary" color={resolvedColors.primary} />
                      <Text className="text-lg font-semibold text-foreground">
                        Payment Summary
                      </Text>
                    </View>

                    <View className="space-y-3">
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Status:</Text>
                        <Badge
                          variant={
                            order.payment_status.toLowerCase() === "paid" ? "success" : "outline"
                          }
                        >
                          <Text className="text-xs capitalize">
                            {order.payment_status}
                          </Text>
                        </Badge>
                      </View>

                      <Separator />

                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Subtotal:</Text>
                        <Text className="text-foreground font-medium">
                          TShs {order.totals.subtotal.toLocaleString()}
                        </Text>
                      </View>

                      {order.totals.discount > 0 && (
                        <View className="flex-row justify-between">
                          <Text className="text-muted-foreground">Discount:</Text>
                          <Text className="text-success font-medium">
                            -TShs {order.totals.discount.toLocaleString()}
                          </Text>
                        </View>
                      )}

                      {order.totals.tax > 0 && (
                        <View className="flex-row justify-between">
                          <Text className="text-muted-foreground">Tax:</Text>
                          <Text className="text-foreground font-medium">
                            TShs {order.totals.tax.toLocaleString()}
                          </Text>
                        </View>
                      )}

                      {order.totals.shipping && (
                        <View className="flex-row justify-between">
                          <Text className="text-muted-foreground">Shipping:</Text>
                          <Text className="text-foreground font-medium">
                            TShs {order.totals.shipping.toLocaleString()}
                          </Text>
                        </View>
                      )}

                      <Separator />

                      <View className="flex-row justify-between">
                        <Text className="text-lg font-semibold text-foreground">
                          Total:
                        </Text>
                        <Text className="text-xl font-bold text-success">
                          TShs {order.totals.total.toLocaleString()}
                        </Text>
                      </View>

                      {order.payment_details.method && (
                        <>
                          <Separator />
                          <View className="flex-row justify-between">
                            <Text className="text-muted-foreground">Method:</Text>
                            <Text className="text-foreground capitalize">
                              {order.payment_details.method}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </Card>

                  {/* Delivery Address - only show if delivery enabled */}
                  {isDeliveryEnabled && (
                  <Card className="mb-6 p-6">
                    <View className="flex-row items-center gap-3 mb-4">
                      <MapPin size={20} className="text-primary" color={resolvedColors.primary} />
                      <Text className="text-lg font-semibold text-foreground">
                        Delivery Address
                      </Text>
                    </View>

                    <View className="space-y-2">
                      <View className="flex-row items-center gap-2">
                        <User size={16} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
                        <Text className="font-semibold text-foreground">
                          {order.shipping_address.first_name} {order.shipping_address.last_name}
                        </Text>
                      </View>

                      <Text className="text-muted-foreground text-sm">
                        {order.shipping_address.address_line1}
                      </Text>
                      {order.shipping_address.address_line2 && (
                        <Text className="text-muted-foreground text-sm">
                          {order.shipping_address.address_line2}
                        </Text>
                      )}
                      <Text className="text-muted-foreground text-sm">
                        {order.shipping_address.city}, {order.shipping_address.state_province}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {order.shipping_address.postal_code}, {order.shipping_address.country}
                      </Text>

                      <Separator className="my-2" />

                      <View className="flex-row items-center gap-2">
                        <Phone size={16} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
                        <Text className="text-sm text-foreground">
                          {order.shipping_address.phone}
                        </Text>
                      </View>
                    </View>
                  </Card>
                  )}

                  {/* Order Information */}
                  <Card className="mb-6 p-6">
                    <View className="flex-row items-center gap-3 mb-4">
                      <Calendar size={20} className="text-primary" color={resolvedColors.primary} />
                      <Text className="text-lg font-semibold text-foreground">
                        Order Information
                      </Text>
                    </View>

                    <View className="space-y-3">
                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Order ID</Text>
                        <Text className="text-sm font-mono text-foreground">{order.order_id}</Text>
                      </View>

                      <Separator />

                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Created</Text>
                        <Text className="text-sm text-foreground">{formatDate(order.created_at)}</Text>
                      </View>

                      {order.paid_at && (
                        <>
                          <View>
                            <Text className="text-xs text-muted-foreground mb-1">Paid At</Text>
                            <Text className="text-sm text-foreground">{formatDate(order.paid_at)}</Text>
                          </View>
                        </>
                      )}

                      {order.fulfilled_at && (
                        <>
                          <View>
                            <Text className="text-xs text-muted-foreground mb-1">Fulfilled At</Text>
                            <Text className="text-sm text-foreground">{formatDate(order.fulfilled_at)}</Text>
                          </View>
                        </>
                      )}

                      {order.cancelled_at && (
                        <>
                          <View>
                            <Text className="text-xs text-muted-foreground mb-1">Cancelled At</Text>
                            <Text className="text-sm text-destructive">{formatDate(order.cancelled_at)}</Text>
                          </View>
                        </>
                      )}

                      {order.payment_details.transaction_id && (
                        <>
                          <Separator />
                          <View>
                            <Text className="text-xs text-muted-foreground mb-1">Transaction ID</Text>
                            <Text className="text-sm font-mono text-foreground">{order.payment_details.transaction_id}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </Card>

                  {/* Rating CTA */}
                  {ratingsAllowed && (
                    <Card className="mb-6 p-6 border-primary">
                      <View className="flex-row items-center gap-3 mb-3">
                        <Star size={20} className="text-primary" color={resolvedColors.primary} />
                        <Text className="text-lg font-semibold text-foreground">
                          Rate Your Experience
                        </Text>
                      </View>
                      <Text className="text-sm text-muted-foreground mb-4">
                        Share your experience to help other customers.
                      </Text>
                      <Button
                        variant="default"
                        onPress={() => setShowRatingsModal(true)}
                        className="w-full"
                      >
                        <Star size={18} className="mr-2" color="#fff" />
                        <Text className="text-white font-semibold">
                          Rate & Review
                        </Text>
                      </Button>
                    </Card>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Ticket Creation Modal */}
          <Modal
            visible={showTicketDialog}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTicketDialog(false)}
          >
            <View className="flex-1 bg-black/50 items-center justify-center p-4">
              <Card className="w-full max-w-lg bg-card p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-foreground">
                    Raise a Support Ticket
                  </Text>
                  <TouchableOpacity onPress={() => setShowTicketDialog(false)}>
                    <ArrowLeft size={24} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
                  </TouchableOpacity>
                </View>

                <ScrollView className="max-h-96">
                  <View className="gap-4">
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Subject *
                      </Text>
                      <Input
                        placeholder="Brief description of the issue"
                        value={ticketForm.subject}
                        onChangeText={(text) =>
                          setTicketForm({ ...ticketForm, subject: text })
                        }
                        className="border border-border"
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Message *
                      </Text>
                      <Input
                        placeholder="Detailed description of your issue"
                        value={ticketForm.initial_message}
                        onChangeText={(text) =>
                          setTicketForm({ ...ticketForm, initial_message: text })
                        }
                        multiline
                        numberOfLines={4}
                        className="border border-border h-24"
                        style={{ textAlignVertical: 'top' }}
                      />
                    </View>

                    <View className="bg-muted p-3 rounded-lg">
                      {/* <Text className="text-xs text-muted-foreground mb-2">
                        Ticket Information:
                      </Text>
                      <View className="gap-1">
                        <Text className="text-xs text-foreground">
                          Category: <Text className="font-semibold">Order</Text>
                        </Text>
                        <Text className="text-xs text-foreground">
                          Priority: <Text className="font-semibold">Medium</Text>
                        </Text>
                        <Text className="text-xs text-foreground">
                          Order ID: <Text className="font-semibold">{ticketForm.order_id}</Text>
                        </Text>
                        {ticketForm.vendor_id && (
                          <Text className="text-xs text-foreground">
                            Vendor ID: <Text className="font-semibold">{ticketForm.vendor_id}</Text>
                          </Text>
                        )}
                      </View> */}
                    </View>
                  </View>
                </ScrollView>

                <View className="flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    onPress={() => setShowTicketDialog(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    onPress={handleSubmitTicket}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Text className="text-primary">
                      {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </Text>
                  </Button>
                </View>
              </Card>
            </View>
          </Modal>

          {/* Ratings Modal */}
          <OrderRatingsModal
            visible={showRatingsModal}
            onClose={() => setShowRatingsModal(false)}
            order={order}
            delivery={delivery}
            groupedItems={groupedItems}
          />
        </SafeAreaView>
      </DesktopLayoutWrapper>
    );
  }

  // Mobile Layout (Original)
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Order Details
        </Text>
        <Button variant="ghost" size="icon" onPress={handleShareOrder}>
          <Share2 size={24} className="text-foreground" color={resolvedColors.foreground} />
        </Button>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Header */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground mb-2">
                  Order #{order.order_number}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Placed on {formatDate(order.created_at)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Badge
                  variant={getStatusVariant(order.status)}
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  <Text className="text-sm text-foreground capitalize">
                    {order.status}
                  </Text>
                </Badge>
              </View>
            </View>

            <Separator className="mb-4" />

            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                Total
              </Text>
              <Text className="text-xl font-bold text-success">
                TShs {order.totals.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Order Timeline */}
        <OrderTimeline
          orderStatus={order.status as any}
          paymentStatus={order.payment_status as any}
          userRole="buyer"
          createdAt={order.created_at}
          paidAt={order.paid_at || undefined}
          fulfilledAt={order.fulfilled_at || undefined}
          cancelledAt={order.cancelled_at || undefined}
          collapsible={true}
          defaultExpanded={false}
          className="mb-6"
        />

        {/* Payment Pending Alert */}
        {order.payment_status.toLowerCase() === "pending" && isPaymentsEnabled && (
          <Card className="mb-6 border-warning">
            <View className="p-4">
              <View className="flex-row mb-4">
                <AlertCircle size={20} className="text-warning" color={resolvedColors.warning} />
                <Text className="text-lg font-semibold text-warning pl-2">
                  Payment Pending
                </Text>
              </View>

              <Text className="text-muted-foreground mb-4">
                Your order is waiting for payment completion. Complete your
                payment now to process your order.
              </Text>

              <Button
                variant="outline"
                onPress={handleCompletePayment}
                className="w-full bg-warning"
              >
                <Text className="text-primary font-semibold">
                  Complete Payment - TShs {order.totals.total.toLocaleString()}
                </Text>
              </Button>
            </View>
          </Card>
        )}

        {/* Order Items Grouped by Store */}
        {Object.values(groupedItems).map((storeGroup) => (
          <Card key={storeGroup.store_id} className="mb-6">
            <View className="p-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row">
                  <Package size={20} className="text-primary mr-2" color={resolvedColors.primary} />
                  <View>
                    <Text className="text-lg font-semibold text-foreground pl-2">
                      {storeGroup.store_name}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {storeGroup.items.length} item{storeGroup.items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                {ratingsAllowed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowRatingsModal(true)}
                  >
                    <Text className="text-sm">Rate & Review</Text>
                  </Button>
                )}
              </View>

              {storeGroup.items.map((item, index) => {
                const productImage = item?.product_id ? getProductImage(item.product_id) : null;

                return (
                  <View key={item.item_id}>
                    <View className="flex-row items-start py-3">
                      <View className="w-16 h-16 rounded-lg bg-muted mr-3 overflow-hidden">
                        {productImage ? (
                          <Image
                            source={{ uri: productImage }}
                            className="w-full h-full"
                            style={{ resizeMode: 'cover' }}
                          />
                        ) : (
                          <View className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-muted-foreground" />
                          </View>
                        )}
                      </View>

                      <View className="flex-1 mr-4">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {item.name}
                        </Text>
                        <Text className="text-sm text-muted-foreground mb-1">
                          SKU: {item.sku}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-base font-semibold text-foreground">
                          TShs {item.total.toLocaleString()}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          TShs {item.unit_price.toLocaleString()} each
                        </Text>
                      </View>
                    </View>
                    {index < storeGroup.items.length - 1 && <Separator />}
                  </View>
                );
              })}
            </View>
          </Card>
        ))}

        {/* Delivery Timeline */}
        {delivery && (
          <View className="mb-6">
            <DeliveryTimeline
              timeline={deliveryTimeline}
              currentStage={delivery.current_stage}
              estimatedDelivery={delivery.estimated_delivery_time || undefined}
              actualDelivery={(delivery as any).actual_delivery_time}
              partnerType={deliveryPartner?.type || 'individual'}
              collapsible={true}
              defaultExpanded={false}
            />
          </View>
        )}

        {/* Shipping Address */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <MapPin size={20} className="text-primary mr-2" color={resolvedColors.primary} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Delivery Address
              </Text>
            </View>

            <View className="gap-1">
              <Text className="font-semibold text-foreground">
                {order.shipping_address.first_name}{" "}
                {order.shipping_address.last_name}
              </Text>
              <Text className="text-muted-foreground">
                {order.shipping_address.address_line1}
              </Text>
              {order.shipping_address.address_line2 && (
                <Text className="text-muted-foreground">
                  {order.shipping_address.address_line2}
                </Text>
              )}
              <Text className="text-muted-foreground">
                {order.shipping_address.city},{" "}
                {order.shipping_address.state_province}
              </Text>
              <Text className="text-muted-foreground">
                {order.shipping_address.postal_code},{" "}
                {order.shipping_address.country}
              </Text>

              <View className="pt-2">
                <View className="flex-row items-center">
                  <Phone size={14} className="text-muted-foreground mr-2" color={resolvedColors.mutedForeground} />
                  <Text className="text-sm text-muted-foreground ml-2">
                    {order.shipping_address.phone}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Payment Details */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <CreditCard size={20} className="text-primary mr-2" color={resolvedColors.primary} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Payment Information
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Payment Status:</Text>
                <Badge
                  className={
                    order.payment_status.toLowerCase() === "paid"
                      ? "bg-green-500"
                      : "bg-outline"
                  }
                  variant={
                    order.payment_status.toLowerCase() === "paid" ? "success" : "outline"
                  }
                >
                  <Text className="text-sm text-foreground">
                    {order.payment_status.toUpperCase()}
                  </Text>
                </Badge>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Payment Method:</Text>
                <Text className="text-foreground capitalize">
                  {/* {order.payment_details.method} */}
                  AFRIZON
                </Text>
              </View>

              {order.payment_details.transaction_id && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Transaction ID:</Text>
                  <Text className="text-foreground font-mono text-sm">
                    {order.payment_details.transaction_id}
                  </Text>
                </View>
              )}

              {order.payment_details.paid_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Paid At:</Text>
                  <Text className="text-foreground">
                    {formatDate(order.payment_details.paid_at)}
                  </Text>
                </View>
              )}

              <Separator />

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Subtotal:</Text>
                <Text className="text-foreground">
                  TShs {order.totals.subtotal.toLocaleString()}
                </Text>
              </View>

              {order.totals.discount > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Discount:</Text>
                  <Text className="text-success">
                    -TShs {order.totals.discount.toLocaleString()}
                  </Text>
                </View>
              )}

              {order.totals.tax > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Tax:</Text>
                  <Text className="text-foreground">
                    TShs {order.totals.tax.toLocaleString()}
                  </Text>
                </View>
              )}

              {order.totals.shipping && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Shipping:</Text>
                  <Text className="text-foreground">
                    TShs {order.totals.shipping.toLocaleString()}
                  </Text>
                </View>
              )}

              <Separator />

              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-foreground">
                  Total:
                </Text>
                <Text className="text-lg font-bold text-success">
                  TShs {order.totals.total.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Order Timeline Card */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} className="text-primary mr-2" color={resolvedColors.primary} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Order Timeline
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Order Placed:</Text>
                <Text className="text-foreground">
                  {formatDate(order.created_at)}
                </Text>
              </View>

              {order.paid_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">
                    Payment Confirmed:
                  </Text>
                  <Text className="text-foreground">
                    {formatDate(order.paid_at)}
                  </Text>
                </View>
              )}

              {order.fulfilled_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">
                    Order Fulfilled:
                  </Text>
                  <Text className="text-foreground">
                    {formatDate(order.fulfilled_at)}
                  </Text>
                </View>
              )}

              {order.cancelled_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">
                    Order Cancelled:
                  </Text>
                  <Text className="text-destructive">
                    {formatDate(order.cancelled_at)}
                  </Text>
                </View>
              )}
            </View>

            {order.notes && (
              <>
                <Separator className="my-4" />
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Notes:
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {order.notes}
                  </Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Rating CTA */}
        {ratingsAllowed && (
          <Card className="mb-6 border-primary">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <Star size={24} className="text-primary mr-2" color={resolvedColors.primary} />
                <Text className="text-lg font-semibold text-foreground ml-2">
                  Rate Your Experience
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground mb-4">
                Your order has been delivered! Share your experience.
              </Text>
              <Button
                variant="default"
                onPress={() => setShowRatingsModal(true)}
                className="w-full"
              >
                <Star size={20} className="mr-2" color="#fff" />
                <Text className="text-white font-semibold">
                  Rate Products, Store & Delivery
                </Text>
              </Button>
            </View>
          </Card>
        )}

        {/* Raise Ticket Button */}
        <Card className="mb-6">
          <View className="p-4">
            <Button
              variant="outline"
              onPress={handleOpenTicketDialog}
              className="w-full flex-row"
            >
              <MessageSquare size={20} className="mr-2" color={resolvedColors.foreground} />
              <Text className="text-foreground font-semibold pl-2">
                Raise a Support Ticket
              </Text>
            </Button>
          </View>
        </Card>

        {/* Ticket Modal - Same as Desktop */}
        <Modal
          visible={showTicketDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTicketDialog(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-card p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">
                  Raise a Support Ticket
                </Text>
                <TouchableOpacity onPress={() => setShowTicketDialog(false)}>
                  <ArrowLeft size={24} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Subject *
                    </Text>
                    <Input
                      placeholder="Brief description of the issue"
                      value={ticketForm.subject}
                      onChangeText={(text) =>
                        setTicketForm({ ...ticketForm, subject: text })
                      }
                      className="border border-border"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Message *
                    </Text>
                    <Input
                      placeholder="Detailed description of your issue"
                      value={ticketForm.initial_message}
                      onChangeText={(text) =>
                        setTicketForm({ ...ticketForm, initial_message: text })
                      }
                      multiline
                      numberOfLines={4}
                      className="border border-border h-24"
                      style={{ textAlignVertical: 'top' }}
                    />
                  </View>

                  {/* <View className="bg-muted p-3 rounded-lg">
                    <Text className="text-xs text-muted-foreground mb-2">
                      Ticket Information:
                    </Text>
                    <View className="gap-1">
                      <Text className="text-xs text-foreground">
                        Category: <Text className="font-semibold">Order</Text>
                      </Text>
                      <Text className="text-xs text-foreground">
                        Priority: <Text className="font-semibold">Medium</Text>
                      </Text>
                      <Text className="text-xs text-foreground">
                        Order ID: <Text className="font-semibold">{ticketForm.order_id}</Text>
                      </Text>
                      {ticketForm.vendor_id && (
                        <Text className="text-xs text-foreground">
                          Vendor ID: <Text className="font-semibold">{ticketForm.vendor_id}</Text>
                        </Text>
                      )}
                    </View>
                  </View> */}
                </View>
              </ScrollView>

              <View className="flex-row gap-3 mt-6">
                <Button
                  variant="outline"
                  onPress={() => setShowTicketDialog(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Text>Cancel</Text>
                </Button>
                <Button
                  onPress={handleSubmitTicket}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Text className="text-primary">
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Text>
                </Button>
              </View>
            </Card>
          </View>
        </Modal>
      </ScrollView>

      {/* Ratings Modal */}
      <OrderRatingsModal
        visible={showRatingsModal}
        onClose={() => setShowRatingsModal(false)}
        order={order}
        delivery={delivery}
        groupedItems={groupedItems}
      />
    </SafeAreaView>
  );
}
import React, { useCallback, useState } from "react";
import { View, ScrollView, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
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
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useGetOrder, useGetOrderByNumber } from "@/src/services/orders";
import { useDeliveryByOrder } from "@/src/services/delivery";
import { useProductDetails } from "@/hooks/useProductDetails";
import * as Sharing from 'expo-sharing';
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Terminal } from "@/lib/icons/Terminal";
import { OrderDetailsSkeleton } from "@/components/ui/skeleton";
import { OrderRatingsModal } from "@/components/modals/OrderRatingsModal";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { DeliveryTimeline } from "@/components/orders/DeliveryTimeline";
import { useTenantModules } from "@/hooks/useTenantModules";

export default function OrderDetailsScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isPaymentsEnabled } = useTenantModules();
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingsModal, setShowRatingsModal] = useState(false);

  // Determine if the orderId is an order number (starts with "ORD-") or order ID
  const isOrderNumber = React.useMemo(() => {
    return typeof orderId === 'string' && orderId.startsWith('ORD-');
  }, [orderId]);

  // Use the appropriate hook based on whether we have order number or order ID
  const orderByIdResult = useGetOrder(
    orderId, 
    !!orderId && !isOrderNumber
  );
  
  const orderByNumberResult = useGetOrderByNumber(
    orderId, 
    !!orderId && isOrderNumber
  );

  // Use the result from whichever hook is active
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = isOrderNumber ? orderByNumberResult : orderByIdResult;

  // Extract order_id from the fetched order for delivery API
  const orderIdForDelivery = React.useMemo(() => {
    return order?.order_id;
  }, [order?.order_id]);

  // Fetch delivery details using the order_id from the fetched order
  const {
    data: delivery,
    isLoading: deliveryLoading,
    refetch: refetchDelivery,
  } = useDeliveryByOrder(orderIdForDelivery || '', !!orderIdForDelivery);

  // Extract product IDs from order items and fetch product details
  const productIds = React.useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];
    return order.items.map(item => item?.product_id).filter(Boolean);
  }, [order?.items]);

  // Fetch product details for all items in the order
  const {
    getProductImage,
    isLoading: productsLoading,
    hasError: productsError,
  } = useProductDetails(productIds);

  // Refetch order data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        refetch();
        if (orderIdForDelivery) {
          refetchDelivery();
        }
      }
    }, [orderId, refetch, refetchDelivery, orderIdForDelivery])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const promises: Promise<any>[] = [refetch()];
      if (orderIdForDelivery) {
        promises.push(refetchDelivery());
      }
      await Promise.all(promises);
    } catch (error) {
      console.error("Error refreshing order:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchDelivery, orderIdForDelivery]);

  // Group order items by store_id for better presentation
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

  // Check if ratings are allowed (order paid and delivery completed)
  const ratingsAllowed = React.useMemo(() => {
    return (
      order?.payment_status.toLowerCase() === 'paid' && 
      delivery?.current_stage?.toLowerCase() === 'delivered'
    );
  }, [order?.payment_status, delivery?.current_stage]);

  // Get delivery timeline for display
  const deliveryTimeline = React.useMemo(() => {
    if (!delivery?.stages) return [];
    
    return delivery.stages.map((stage, index) => ({
      stage: stage.stage,
      timestamp: stage.timestamp,
      location: stage.location && typeof stage.location === 'object' && 'lat' in stage.location && 'lng' in stage.location 
        ? { lat: stage.location.lat, lng: stage.location.lng } 
        : undefined,
      proof: (stage as any).proof || null, // Handle proof if exists
      isLatest: index === delivery.stages.length - 1
    }));
  }, [delivery?.stages]);

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "default"; // Green
      case "pending":
      case "processing":
        return "secondary"; // Gray/Blue
      case "cancelled":
      case "failed":
        return "destructive"; // Red
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#22c55e"; // Green
      case "delivered":
        return "#22c55e"; // Green
      case "pending":
      case "processing":
        return "#eab308"; // Yellow
      case "cancelled":
      case "failed":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
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

    // Navigate to payment page with order details using absolute path
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
    if (!order) return;

    // try {
    //   const orderUrl = createOrderUrl(order.order_number);
    //   await Sharing.shareAsync(orderUrl, {
    //     mimeType: 'text/plain',
    //     dialogTitle: 'Share Order Details',
    //   });
    // } catch (error) {
    //   console.error('Error sharing order:', error);
    // }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <OrderDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (!order || isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
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
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Order Details
        </Text>
        <Button variant="ghost" size="icon" onPress={handleShareOrder}>
          <Share2 size={24} className="text-foreground" />
        </Button>
      </View> */}

      <ScrollView
        className="flex-1 pt-2"
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
              <Badge
                variant={getStatusVariant(order.status)}
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                <Text className="text-sm text-white capitalize">
                  {order.status}
                </Text>
              </Badge>
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
              <View className="flex-row items-center mb-3">
                <AlertCircle size={20} className="text-warning mr-2" />
                <Text className="text-lg font-semibold text-warning">
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
                <View className="flex-row items-center">
                  <Package size={20} className="text-primary mr-2" />
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
                    <Text className="text-sm">Rate & Review</Text>
                  </Button>
                )}
              </View>

              {storeGroup.items.map((item, index) => {
                const productImage = item?.product_id ? getProductImage(item.product_id) : null;
                
                return (
                  <View key={item.item_id}>
                    <View className="flex-row items-start py-3">
                      {/* Product Image */}
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

                      {/* Product Details */}
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

                      {/* Price Details */}
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
              collapsible={true}
              defaultExpanded={false}
            />
            
            {ratingsAllowed && (
              <View className="mt-4">
                <Button
                  variant="outline"
                  onPress={() => setShowRatingsModal(true)}
                  className="w-full"
                >
                  <Text className="text-sm">Rate Delivery Experience</Text>
                </Button>
              </View>
            )}
          </View>
        )}

        {/* Shipping Address */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <MapPin size={20} className="text-primary mr-2" />
              <Text className="text-lg font-semibold text-foreground">
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
                  <Phone size={14} className="text-muted-foreground mr-2" />
                  <Text className="text-sm text-muted-foreground">
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
              <CreditCard size={20} className="text-primary mr-2" />
              <Text className="text-lg font-semibold text-foreground">
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
                      : "bg-secondary"
                  }
                  variant={
                    order.payment_status.toLowerCase() === "paid" ? "default" : "secondary"
                  }
                >
                  <Text className="text-sm text-white capitalize text-warning">
                    {order.payment_status}
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

        {/* Order Timeline */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} className="text-primary mr-2" />
              <Text className="text-lg font-semibold text-foreground">
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

        {/* Rating Call-to-Action */}
        {ratingsAllowed && (
          <Card className="mb-6 border-primary">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <Star size={24} className="text-primary mr-2" />
                <Text className="text-lg font-semibold text-foreground">
                  Rate Your Experience
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground mb-4">
                Your order has been delivered! Share your experience to help other customers and improve our service.
              </Text>
              <Button
                onPress={() => setShowRatingsModal(true)}
                className="w-full"
                size="lg"
              >
                <View className="flex-row items-center">
                  <Star size={20} className="text-primary-foreground mr-2" />
                  <Text className="text-primary-foreground font-semibold">
                    Rate Products, Store & Delivery
                  </Text>
                </View>
              </Button>
            </View>
          </Card>
        )}
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

import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Package, Clock, MapPin, Check, X, ChevronDown, ChevronUp, User, Calendar, CreditCard, Phone, CheckCircle } from "lucide-react-native";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdateDialog } from "@/components/dialogs/OrderStatusUpdateDialog";
import { OrderStatus } from "../OrderStatus";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { useUpdateOrderStatus, useVendorResponse } from "@/src/services/order-management";
import { useAuth } from "@/context/auth";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useResponsive } from "@/hooks/useResponsive";
import type { Order } from "@/src/services/types/orders";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface VendorOrderDetailsProps {
  order: Order;
  onOrderUpdated?: () => void;
}

interface DialogConfig {
  title: string;
  description: string;
  confirmText: string;
  confirmVariant: "default" | "destructive";
  newStatus: string;
  action: string;
}

export const VendorOrderDetails = ({
  order,
  onOrderUpdated,
}: VendorOrderDetailsProps) => {
  const { user, getVendorDetails } = useAuth();
  const { isDesktop } = useResponsive();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const vendorResponseMutation = useVendorResponse();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const resolvedThemeColors = useResolvedThemeColors();
  const vendorDetails = getVendorDetails();
  const [customerDetailsExpanded, setCustomerDetailsExpanded] = useState(false);

  const productIds = useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];
    return order.items.map(item => item?.product_id).filter(Boolean);
  }, [order?.items]);

  const {
    getProductImage,
    isLoading: productsLoading,
    hasError: productsError,
  } = useProductDetails(productIds);

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

  const updateOrderStatus = async (newStatus: string, action: string) => {
    updateOrderStatusMutation.mutate(
      {
        orderId: order.order_id,
        data: { status: newStatus as any },
      },
      {
        onSuccess: () => {
          onOrderUpdated?.();
          setDialogOpen(false);
          setDialogConfig(null);
        },
        onError: (error) => {
          console.error(`Failed to ${action.toLowerCase()} order:`, error);
        },
      }
    );
  };

  const openDialog = (config: DialogConfig) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const handleAcceptOrder = () => {
    if (!vendorDetails?.vendor_id) {
      console.error("No vendor ID found");
      return;
    }

    vendorResponseMutation.mutate(
      {
        orderId: order.order_id,
        vendorId: vendorDetails.vendor_id,
        data: { response: "accept" },
      },
      {
        onSuccess: () => {
          onOrderUpdated?.();
        },
        onError: (error) => {
          console.error("Failed to accept order:", error);
        },
      }
    );
  };

  const handleRejectOrder = () => {
    if (!vendorDetails?.vendor_id) {
      console.error("No vendor ID found");
      return;
    }

    vendorResponseMutation.mutate(
      {
        orderId: order.order_id,
        vendorId: vendorDetails.vendor_id,
        data: { response: "reject" },
      },
      {
        onSuccess: () => {
          onOrderUpdated?.();
        },
        onError: (error) => {
          console.error("Failed to reject order:", error);
        },
      }
    );
  };

  const handleMarkReady = () => {
    openDialog({
      title: "Mark Ready for Pickup",
      description: "Mark this order as ready for pickup?",
      confirmText: "Mark Ready",
      confirmVariant: "default",
      newStatus: "shipped",
      action: "marked as ready",
    });
  };

  const handleMarkDelivered = () => {
    openDialog({
      title: "Mark as Delivered",
      description: "Confirm that this order has been delivered?",
      confirmText: "Mark Delivered",
      confirmVariant: "default",
      newStatus: "delivered",
      action: "marked as delivered",
    });
  };

  const handleConfirmHandover = () => {
    openDialog({
      title: "Confirm Handover",
      description: "Confirm that you have handed over the package to the delivery partner?",
      confirmText: "Confirm Handover",
      confirmVariant: "default",
      newStatus: "picked_up",
      action: "handed over",
    });
  };

  const handleCompleteOrder = () => {
    openDialog({
      title: "Complete Order",
      description: "Mark this order as completed?",
      confirmText: "Complete",
      confirmVariant: "default",
      newStatus: "completed",
      action: "completed",
    });
  };

  const handleConfirm = () => {
    if (dialogConfig) {
      updateOrderStatus(dialogConfig.newStatus, dialogConfig.action);
    }
  };

  // Desktop Layout
  if (isDesktop) {
    return (
      <View className="flex-1 bg-background">
        <ScrollView className="flex-1">
          <View className="p-6">
            {/* Two Column Layout */}
            <View className="flex-row gap-6">
              {/* Left Column - Main Content */}
              <View className="flex-1">
                {/* Order Status Banner */}
                <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: getStatusColor(order.status) + '20' }}
                      >
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
                        {order.totals.total.toLocaleString()} {order.currency}
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
                    userRole="vendor"
                    createdAt={order.created_at}
                    paidAt={order.paid_at || undefined}
                    fulfilledAt={order.fulfilled_at || undefined}
                    cancelledAt={order.cancelled_at || undefined}
                    collapsible={false}
                    defaultExpanded={true}
                  />
                </Card>

                {/* Order Items */}
                <Card className="mb-6 p-6">
                  <View className="flex-row items-center gap-3 mb-4">
                    <Package size={20} className="text-primary" color={resolvedThemeColors.primary} />
                    <View>
                      <Text className="text-lg font-semibold text-foreground">
                        Order Items
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  <Separator className="my-4" />

                  {order.items.map((item, index) => {
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
                              Quantity: {item.quantity} × {item.unit_price.toLocaleString()} {order.currency}
                            </Text>
                          </View>

                          <View className="items-end">
                            <Text className="text-lg font-semibold text-foreground">
                              {item.total.toLocaleString()} {order.currency}
                            </Text>
                            {item.discount > 0 && (
                              <Text className="text-sm text-success">
                                -{item.discount.toLocaleString()} discount
                              </Text>
                            )}
                          </View>
                        </View>
                        {index < order.items.length - 1 && <Separator />}
                      </View>
                    );
                  })}
                </Card>

                {/* Order Notes */}
                {order.notes && (
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Order Notes
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {order.notes}
                    </Text>
                  </Card>
                )}

                {/* Ready for Pickup Button for Processing orders */}
                {order.status.toLowerCase() === "processing" && (
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Order Readiness
                    </Text>
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onPress={handleMarkReady}
                      disabled={updateOrderStatusMutation.isPending}
                      style={{ backgroundColor: resolvedThemeColors.primary }}
                    >
                      <Package size={20} className="mr-2" color="#fff" />
                      <Text className="text-white font-semibold">
                        {updateOrderStatusMutation.isPending ? "Processing..." : "Mark Ready for Pickup"}
                      </Text>
                    </Button>
                  </Card>
                )}
              </View>

              {/* Right Column - Sidebar */}
              <View className="w-96">
                {/* Action Buttons */}
                {(order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "processing") && (
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Quick Actions
                    </Text>
                    <View className="gap-3">
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full"
                        onPress={handleAcceptOrder}
                        disabled={vendorResponseMutation.isPending}
                      >
                        <Check size={20} className="mr-2" color="#fff" />
                        <Text className="text-white font-semibold">
                          {vendorResponseMutation.isPending ? "Processing..." : "Accept Order"}
                        </Text>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onPress={handleRejectOrder}
                        disabled={vendorResponseMutation.isPending}
                      >
                        <X size={20} className="mr-2 text-destructive" color={resolvedThemeColors.destructive} />
                        <Text className="text-destructive font-semibold">
                          {vendorResponseMutation.isPending ? "Processing..." : "Reject Order"}
                        </Text>
                      </Button>
                    </View>
                  </Card>
                )}

                {order.status.toLowerCase() === "shipped" && (
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Quick Actions
                    </Text>
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onPress={handleConfirmHandover}
                      disabled={updateOrderStatusMutation.isPending}
                    >
                      <Check size={20} className="mr-2" color="#fff" />
                      <Text className="text-white font-semibold">
                        {updateOrderStatusMutation.isPending ? "Processing..." : "Confirm Handover"}
                      </Text>
                    </Button>
                  </Card>
                )}

                {order.status.toLowerCase() === "picked_up" && (
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Quick Actions
                    </Text>
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onPress={handleMarkDelivered}
                      disabled={updateOrderStatusMutation.isPending}
                    >
                      <Check size={20} className="mr-2" color="#fff" />
                      <Text className="text-white font-semibold">
                        {updateOrderStatusMutation.isPending ? "Processing..." : "Mark as Delivered"}
                      </Text>
                    </Button>
                  </Card>
                )}

                {order.status.toLowerCase() === "delivered" && (
                  <Card className="mb-6 p-6">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      Quick Actions
                    </Text>
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onPress={handleCompleteOrder}
                      disabled={updateOrderStatusMutation.isPending}
                    >
                      <Check size={20} className="mr-2" color="#fff" />
                      <Text className="text-white font-semibold">
                        {updateOrderStatusMutation.isPending ? "Processing..." : "Complete Order"}
                      </Text>
                    </Button>
                  </Card>
                )}

                {/* Order Summary */}
                <Card className="mb-6 p-6">
                  <View className="flex-row items-center gap-3 mb-4">
                    <CreditCard size={20} className="text-primary" color={resolvedThemeColors.primary} />
                    <Text className="text-lg font-semibold text-foreground">
                      Order Summary
                    </Text>
                  </View>

                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">Subtotal:</Text>
                      <Text className="text-foreground font-medium">
                        {order.totals.subtotal.toLocaleString()} {order.currency}
                      </Text>
                    </View>

                    {order.totals.discount > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Discount:</Text>
                        <Text className="text-success font-medium">
                          -{order.totals.discount.toLocaleString()} {order.currency}
                        </Text>
                      </View>
                    )}

                    {order.totals.tax > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Tax:</Text>
                        <Text className="text-foreground font-medium">
                          {order.totals.tax.toLocaleString()} {order.currency}
                        </Text>
                      </View>
                    )}

                    {order.totals.shipping && order.totals.shipping > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Shipping:</Text>
                        <Text className="text-foreground font-medium">
                          {order.totals.shipping.toLocaleString()} {order.currency}
                        </Text>
                      </View>
                    )}

                    <Separator />

                    <View className="flex-row justify-between">
                      <Text className="text-lg font-semibold text-foreground">
                        Total:
                      </Text>
                      <Text className="text-xl font-bold text-success">
                        {order.totals.total.toLocaleString()} {order.currency}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Customer Details */}
                <Card className="mb-6 p-6">
                  <View className="flex-row items-center gap-3 mb-4">
                    <User size={20} className="text-primary" color={resolvedThemeColors.primary} />
                    <Text className="text-lg font-semibold text-foreground">
                      Customer Details
                    </Text>
                  </View>

                  <View className="space-y-2">
                    <View className="flex-row items-center gap-2">
                      <User size={16} className="text-muted-foreground" color={resolvedThemeColors.mutedForeground} />
                      <Text className="font-semibold text-foreground">
                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" color={resolvedThemeColors.mutedForeground} />
                      <Text className="text-sm text-foreground">
                        {order.shipping_address.phone}
                      </Text>
                    </View>

                    <Text className="text-sm text-muted-foreground">
                      {order.shipping_address.email}
                    </Text>

                    <Separator className="my-2" />

                    <View className="flex-row items-start gap-2">
                      <MapPin size={16} className="text-muted-foreground mt-1" color={resolvedThemeColors.mutedForeground} />
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-1">
                          Delivery Address
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {order.shipping_address.address_line1}
                        </Text>
                        {order.shipping_address.address_line2 && (
                          <Text className="text-sm text-muted-foreground">
                            {order.shipping_address.address_line2}
                          </Text>
                        )}
                        <Text className="text-sm text-muted-foreground">
                          {order.shipping_address.city}, {order.shipping_address.state_province}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {order.shipping_address.postal_code}, {order.shipping_address.country}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>

                {/* Payment Information */}
                <Card className="mb-6 p-6">
                  <View className="flex-row items-center gap-3 mb-4">
                    <CreditCard size={20} className="text-primary" color={resolvedThemeColors.primary} />
                    <Text className="text-lg font-semibold text-foreground">
                      Payment Information
                    </Text>
                  </View>

                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">Status:</Text>
                      <Badge variant={order.payment_status.toLowerCase() === "paid" ? "success" : "outline"}>
                        <Text className="text-xs capitalize">
                          {order.payment_status}
                        </Text>
                      </Badge>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">Method:</Text>
                      <Text className="text-foreground capitalize">
                        {order.payment_details.method}
                      </Text>
                    </View>

                    {order.payment_details.transaction_id && (
                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Transaction ID</Text>
                        <Text className="text-sm font-mono text-foreground">
                          {order.payment_details.transaction_id}
                        </Text>
                      </View>
                    )}

                    {order.payment_details.paid_at && (
                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Paid At</Text>
                        <Text className="text-sm text-foreground">
                          {format(new Date(order.payment_details.paid_at), "MMM d, yyyy 'at' h:mm a")}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>

                {/* Order Information */}
                <Card className="mb-6 p-6">
                  <View className="flex-row items-center gap-3 mb-4">
                    <Calendar size={20} className="text-primary" color={resolvedThemeColors.primary} />
                    <Text className="text-lg font-semibold text-foreground">
                      Order Information
                    </Text>
                  </View>

                  <View className="space-y-3">
                    <View>
                      <Text className="text-xs text-muted-foreground mb-1">Order Number</Text>
                      <Text className="text-sm font-semibold text-foreground">#{order.order_number}</Text>
                    </View>

                    <Separator />

                    <View>
                      <Text className="text-xs text-muted-foreground mb-1">Order ID</Text>
                      <Text className="text-sm font-mono text-foreground">{order.order_id}</Text>
                    </View>

                    <Separator />

                    <View>
                      <Text className="text-xs text-muted-foreground mb-1">Created</Text>
                      <Text className="text-sm text-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </Text>
                    </View>

                    {order.paid_at && (
                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Paid At</Text>
                        <Text className="text-sm text-foreground">
                          {format(new Date(order.paid_at), "MMM d, yyyy 'at' h:mm a")}
                        </Text>
                      </View>
                    )}

                    {order.fulfilled_at && (
                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Fulfilled At</Text>
                        <Text className="text-sm text-foreground">
                          {format(new Date(order.fulfilled_at), "MMM d, yyyy 'at' h:mm a")}
                        </Text>
                      </View>
                    )}

                    {order.cancelled_at && (
                      <View>
                        <Text className="text-xs text-muted-foreground mb-1">Cancelled At</Text>
                        <Text className="text-sm text-destructive">
                          {format(new Date(order.cancelled_at), "MMM d, yyyy 'at' h:mm a")}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Order Status Update Dialog */}
        {dialogConfig && (
          <OrderStatusUpdateDialog
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            title={dialogConfig.title}
            description={dialogConfig.description}
            confirmText={dialogConfig.confirmText}
            confirmVariant={dialogConfig.confirmVariant}
            onConfirm={handleConfirm}
            isLoading={updateOrderStatusMutation.isPending}
          />
        )}
      </View>
    );
  }

  // Mobile Layout (Original)
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="gap-6 p-2">
          <View>
            <Text className="text-lg font-semibold mb-4">
              Order Information
            </Text>
            <Text className="text-base font-semibold mb-2">
              #{order.order_number}
            </Text>
            <Text className="text-sm text-muted-foreground mb-2">
              Order ID: {order.order_id}
            </Text>
            <OrderStatus status={order.status} />
            <Text className="text-sm text-muted-foreground mt-2">
              Ordered on{" "}
              {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
            </Text>
          </View>

          {/* Order Timeline */}
          <OrderTimeline
            orderStatus={order.status as any}
            paymentStatus={order.payment_status as any}
            userRole="vendor"
            createdAt={order.created_at}
            paidAt={order.paid_at || undefined}
            fulfilledAt={order.fulfilled_at || undefined}
            cancelledAt={order.cancelled_at || undefined}
            collapsible={true}
            defaultExpanded={false}
            className="mb-2"
          />

          {/* Customer Details - Collapsible */}
          <Card className="p-0">
            <TouchableOpacity
              onPress={() => setCustomerDetailsExpanded(!customerDetailsExpanded)}
              className="p-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <User size={20} className="text-primary mr-2" color={resolvedThemeColors.primary} />
                  <Text className="text-lg font-semibold text-foreground">
                    {' '}Customer Details
                  </Text>
                </View>
                {customerDetailsExpanded ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </View>
            </TouchableOpacity>

            {customerDetailsExpanded ? (
              <View className="px-4 pb-4">
                <View className="gap-3">
                  <Text className="text-sm text-muted-foreground">
                    Name: {order.shipping_address.first_name}{" "}
                    {order.shipping_address.last_name}
                  </Text>
                  {/* <Text className="text-sm text-muted-foreground">
                    Phone: {order.shipping_address.phone}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Email: {order.shipping_address.email}
                  </Text> */}
                  <View className="flex-row items-start gap-x-2">
                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                    <View className="flex-1">
                      {/* <Text className="text-sm text-muted-foreground">
                        Delivery to:
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {order.shipping_address.address_line1}
                        {order.shipping_address.address_line2 &&
                          `, ${order.shipping_address.address_line2}`}
                      </Text> */}
                      <Text className="text-sm text-muted-foreground">
                        {order.shipping_address.city},{" "}
                        {order.shipping_address.state_province}{" "}
                        {order.shipping_address.postal_code}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {order.shipping_address.country}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View className="px-4 pb-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-foreground">
                      {order.shipping_address.first_name}{" "}
                      {order.shipping_address.last_name}
                    </Text>
                    {/* <Text className="text-sm text-muted-foreground">
                      {order.shipping_address.phone}
                    </Text> */}
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-muted-foreground">
                      {order.shipping_address.city}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Tap to view full details
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>

          <View>
            <Text className="text-lg font-semibold mb-4">Items</Text>
            {order.items.map((item) => {
              const productImage = item?.product_id ? getProductImage(item.product_id) : null;

              return (
                <View
                  key={item.item_id}
                  className="flex-row items-center mb-3 p-3 bg-muted rounded-lg gap-x-3"
                >
                  {/* Product Image */}
                  <View className="w-16 h-16 rounded-lg bg-background overflow-hidden">
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

                  {/* Product Details */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-1">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-muted-foreground mb-1">
                      SKU: {item.sku}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {item.unit_price.toLocaleString()}{" "}
                        {order.currency}
                      </Text>
                      <View className="items-end">
                        <Text className="text-base font-semibold">
                          {item.total.toLocaleString()} {order.currency}
                        </Text>
                        {item.discount > 0 && (
                          <Text className="text-xs text-success">
                            -{item.discount.toLocaleString()} discount
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View>
            <Text className="text-lg font-semibold mb-4">Order Summary</Text>
            <View className="gap-3 p-3 bg-muted rounded-lg">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Subtotal</Text>
                <Text className="text-sm font-semibold">
                  {order.totals.subtotal.toLocaleString()} {order.currency}
                </Text>
              </View>
              {order.totals.discount > 0 && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">
                    Discount
                  </Text>
                  <Text className="text-sm font-semibold text-success">
                    -{order.totals.discount.toLocaleString()} {order.currency}
                  </Text>
                </View>
              )}
              {order.totals.tax > 0 && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">Tax</Text>
                  <Text className="text-sm font-semibold">
                    {order.totals.tax.toLocaleString()} {order.currency}
                  </Text>
                </View>
              )}
              {order.totals.shipping && order.totals.shipping > 0 && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">
                    Shipping
                  </Text>
                  <Text className="text-sm font-semibold">
                    {order.totals.shipping.toLocaleString()} {order.currency}
                  </Text>
                </View>
              )}
              <View className="border-t border-border pt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold">Total</Text>
                  <Text className="text-xl font-bold text-primary">
                    {order.totals.total.toLocaleString()} {order.currency}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            <Text className="text-lg font-semibold mb-4">
              Payment Information
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  Payment Method
                </Text>
                <Text className="text-base font-semibold">
                  {order.payment_details.method}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  Payment Status
                </Text>
                <Text className="text-base font-semibold">
                  {order.payment_status}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  Transaction ID
                </Text>
                <Text className="text-sm font-mono">
                  {order.payment_details.transaction_id}
                </Text>
              </View>

              {order.payment_details.paid_at && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">Paid At</Text>
                  <Text className="text-sm font-semibold">
                    {format(
                      new Date(order.payment_details.paid_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {order.notes && (
            <View>
              <Text className="text-lg font-semibold mb-4">Order Notes</Text>
              <Text className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {order.notes}
              </Text>
            </View>
          )}

          {/* Action Buttons Based on Order Status */}
          <View className="mt-6">
            {(order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "processing") && (
              <View className="flex-row justify-between gap-x-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 flex-row items-center justify-center gap-x-2"
                  onPress={handleRejectOrder}
                  disabled={vendorResponseMutation.isPending}
                >
                  <X size={20} className="text-destructive" color={resolvedThemeColors?.foreground || "#000000"} />
                  <Text className="text-destructive">
                    {vendorResponseMutation.isPending
                      ? "Processing..."
                      : "Reject"}
                  </Text>
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 flex-row items-center justify-center gap-x-2"
                  onPress={handleAcceptOrder}
                  disabled={vendorResponseMutation.isPending}
                >
                  <Check size={20} color={resolvedThemeColors?.foreground || "#000000"} />
                  <Text className="text-foreground">
                    {vendorResponseMutation.isPending
                      ? "Processing..."
                      : "Accept"}
                  </Text>
                </Button>
              </View>
            )}

            {order.status.toLowerCase() === "shipped" && (
              <Button
                variant="primary"
                size="lg"
                className="w-full flex-row items-center justify-center gap-x-2"
                onPress={handleMarkDelivered}
                disabled={updateOrderStatusMutation.isPending}
              >
                <Check size={20} color={resolvedThemeColors?.foreground || "#000000"} />
                <Text className="text-foreground">
                  {updateOrderStatusMutation.isPending
                    ? "Processing..."
                    : "Mark as Delivered"}
                </Text>
              </Button>
            )}

            {order.status.toLowerCase() === "delivered" && (
              <Button
                variant="primary"
                size="lg"
                className="w-full flex-row items-center justify-center gap-x-2"
                onPress={handleCompleteOrder}
                disabled={updateOrderStatusMutation.isPending}
              >
                <Check size={20} color={resolvedThemeColors?.foreground || "#000000"} />
                <Text className="text-foreground">
                  {updateOrderStatusMutation.isPending
                    ? "Processing..."
                    : "Complete Order"}
                </Text>
              </Button>
            )}

            {/* Show current status for completed/cancelled orders */}
            {(order.status.toLowerCase() === "completed" ||
              order.status.toLowerCase() === "cancelled" ||
              order.status.toLowerCase() === "refunded") && (
                <View className="text-center p-4 bg-muted rounded-lg">
                  <Text className="text-sm text-muted-foreground">
                    This order is {order.status}. No further actions are
                    available.
                  </Text>
                </View>
              )}
          </View>
        </View>
      </ScrollView>

      {/* Order Status Update Dialog */}
      {dialogConfig && (
        <OrderStatusUpdateDialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmText={dialogConfig.confirmText}
          confirmVariant={dialogConfig.confirmVariant}
          onConfirm={handleConfirm}
          isLoading={updateOrderStatusMutation.isPending}
        />
      )}
    </View>
  );
};
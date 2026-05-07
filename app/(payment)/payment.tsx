import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, TouchableOpacity, Image, BackHandler, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useAuth } from "@/context/auth";
import { useInitiatePayment, paymentsApi } from "@/src/services/payments";
import { useGetOrders, useCreateOrder } from "@/src/services/orders";
import { cartApi } from "@/src/services/cart";
import { useCartTotals } from "@/stores/cart";
import { buyersApi } from "@/src/services/buyers";
import { useDeliveryTypesWithFallback } from "@/src/services/delivery";
import { productsApi, Product } from "@/src/services/products";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "@/lib/icons/Terminal";
import { API_CONFIG } from "@/src/services/config";
import { PaymentMethodSelector, InstallmentPlanCreator, PaymentForm, InstallmentTimeline } from "@/components/payment";
import {
  getPaymentMethodsForCategory,
  getPaymentCategoryName,
  getPaymentMethodName,
  PAYMENT_METHODS,
} from "@/config/payment-methods";
import { OrderSummarySection } from "@/components/checkout";
import { useResponsive } from "@/hooks/useResponsive"; // Assumed import
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";
import { useTenantModules } from "@/hooks/useTenantModules";

// Component to display cart item with fetched product details
// This ensures accurate product data (name, image, SKU, variants) is shown
const CartItemDisplay = ({ item, index, t }: { item: any; index: number; t: any }) => {
  const { data: productDetails, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", item.product_id],
    queryFn: () => productsApi.getProductById(item.product_id),
    enabled: !!item.product_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry failed requests
  });

  // Get variant information if available
  const getVariantInfo = () => {
    if (!productDetails) return null;
    
    // Check if cart item has variant data directly
    const itemWithVariants = item as any;
    if (itemWithVariants.variants?.sku) {
      return itemWithVariants.variants;
    }
    
    // Fallback to checking metadata (for backward compatibility)
    if (!productDetails.has_variants || !item.metadata?.sku) return null;
    
    const variant = productDetails.variants?.find((v: any) => v.sku === item.metadata.sku);
    return variant;
  };

  const variant = getVariantInfo();

  // Use product details if available, otherwise fall back to item metadata
  const productName = productDetails?.name || item.name || item.metadata?.name || `${t("payment.product_id")} ${item.product_id}`;
  const productImage = productDetails?.images?.[0] 
    ? (typeof productDetails.images[0] === 'string' ? productDetails.images[0] : productDetails.images[0].url)
    : item.metadata?.image_url;
  const productSku = productDetails?.sku || item.metadata?.sku || item.sku || 'N/A';

  // Handle different price fields for cart items vs order items
  // Cart items: have both 'unit_price' and 'sale_price' (use sale_price - final price after discounts)
  // Order items: have 'unit_price' and 'total' (use unit_price for per-item, total for line total)
  const unitPrice = item.sale_price ?? item.unit_price ?? 0;
  const totalPrice = item.total ?? item.subtotal ?? (unitPrice * item.quantity);

  return (
    <View key={item.item_id || item.product_id || index} className="p-4 border-b border-border last:border-b-0">
      <View className="flex-row items-center">
        <View className="w-16 h-16 bg-muted rounded-lg mr-3 items-center justify-center">
          {isLoadingProduct ? (
            <Text className="text-xs text-muted-foreground">...</Text>
          ) : productImage ? (
            <Image
              source={{ uri: productImage }}
              className="w-14 h-14 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xs text-muted-foreground">{t("payment.no_image")}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground mb-1">
            {productName}
          </Text>
          {variant && (
            <Text className="text-xs text-primary mb-1">
              {variant.name}: {variant.sku}
            </Text>
          )}
          <Text className="text-xs text-muted-foreground mb-1">
            {t("cart.sku")}: {productSku}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {t("cart.qty")}: {item.quantity}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-semibold text-foreground">
            TShs {totalPrice.toLocaleString()}
          </Text>
          <Text className="text-xs text-muted-foreground">
            TShs {unitPrice.toLocaleString()} {t("products.each")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const PaymentScreen = () => {
  const resolvedThemeColors = useResolvedThemeColors();
  const router = useRouter();
  const { t } = useI18n();
  const { isPaymentsEnabled, isDeliveryEnabled } = useTenantModules();
  const { 
    orderId, 
    paymentMethod: initialPaymentCategory,
    cartId,
    addressId,
    deliveryType,
    vehicleId,
    partnerId,
    returnTo,
    productId
  } = useLocalSearchParams();
  const { user } = useAuth();
  const { isDesktop } = useResponsive(); // Assumed hook

  const [orderData, setOrderData] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [currentPaymentCategory, setCurrentPaymentCategory] = useState<string>(initialPaymentCategory as string);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "completed" | "failed" | "timeout">("idle");
  const [showInstallmentTimeline, setShowInstallmentTimeline] = useState(false);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<number | null>(null);
  const [selectedInstallmentAmount, setSelectedInstallmentAmount] = useState<number>(0);

  // Get available payment methods for the selected category
  const availablePaymentMethods = getPaymentMethodsForCategory(
    currentPaymentCategory as string
  );
  const paymentCategoryName = getPaymentCategoryName(currentPaymentCategory as string, t);


  // API hooks - fetch data needed to create order
  const { data: ordersResponse, isLoading: orderLoading } = useGetOrders(
    { order_id: orderId as string },
    !!orderId
  );
  const order = ordersResponse && 'items' in ordersResponse ? ordersResponse.items[0] : (Array.isArray(ordersResponse) ? ordersResponse[0] : undefined);
  
  // Fetch cart data if no orderId provided
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => cartApi.getOrCreateCart(user?.user_id as string),
    enabled: !orderId && !!user?.user_id,
  });

  // Fetch cart totals - use the hook from stores for consistency
  // Enable when we have a cart (from cart flow)
  const { data: cartTotals, isLoading: cartTotalsLoading } = useCartTotals(
    cartId as string || cart?.cart_id || ""
  );

  // Fetch buyer profile for address details
  const { data: buyerProfile } = useQuery({
    queryKey: ["buyerProfile", user?.user_id],
    queryFn: () => buyersApi.getBuyerProfile(user?.user_id as string),
    enabled: !orderId && !!user?.user_id,
  });


  // Fetch delivery types for cost calculation with fallback
  const { data: deliveryTypes, isUsingFallback } = useDeliveryTypesWithFallback(!orderId);


  usePageTitle(t("payment.checkout"));
  
  // All hooks must be called before any early returns
  const createOrder = useCreateOrder();
  
  // Handle back navigation - defined before useFocusEffect
  const handleBackNavigation = () => {
    // Handle back navigation based on returnTo parameter
    if (returnTo === "orders") {
      router.push("/(buyer)/orders");
    } else if (returnTo === "product" && productId) {
      router.push(`/(buyer)/product/${productId}`);
    } else if (returnTo === "cart") {
      router.push("/(buyer)/cart");
    } else {
      // Default back behavior
      router.back();
    }
  };

  // Handle hardware back button - must be called before early returns
  // Only register BackHandler on native platforms (not web)
  useFocusEffect(
    React.useCallback(() => {
      // BackHandler is only available on native platforms
      if (Platform.OS === 'web') {
        return; // No cleanup needed on web
      }

      const onBackPress = () => {
        // Use our custom back navigation logic
        handleBackNavigation();
        return true; // Prevent default back behavior
      };

      // Add hardware back button listener (native only)
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup
      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    }, [returnTo, productId, handleBackNavigation])
  );

  // Create order data from fetched information
  useEffect(() => {
    if (!orderId && cart && cartTotals && user) {
      // Only check for delivery address if delivery module is enabled
      if (isDeliveryEnabled) {
        // Safely check for delivery_address array before accessing
        if (!buyerProfile || !buyerProfile.delivery_address || !Array.isArray(buyerProfile.delivery_address)) {
          console.error('Buyer profile missing delivery_address array');
          return;
        }
        
        // Wait for deliveryTypes if delivery is enabled
        if (!deliveryTypes) {
          return;
        }
      }

      // Get delivery cost (0 if delivery disabled)
      const selectedDelivery = isDeliveryEnabled ? deliveryTypes?.find(dt => dt.id === deliveryType) : null;
      const deliveryCost = selectedDelivery?.price || 0;
      
      // Calculate total including delivery cost
      const totalWithDelivery = cartTotals.total + deliveryCost;
      
      // Get selected address data if delivery enabled
      const selectedAddress = isDeliveryEnabled && addressId && buyerProfile
        ? buyerProfile.delivery_address?.find((addr) => addr.address_id === addressId)
        : null;
      
      const orderData = {
        cart_id: cart.cart_id,
        // include shipping_address - use default when delivery disabled
        shipping_address: isDeliveryEnabled && selectedAddress ? {
          first_name: user.name.split(' ')[0] || user.name,
          last_name: user.name.split(' ').slice(1).join(' ') || '',
          address_line1: selectedAddress.address_line1,
          city: selectedAddress.city,
          state_province: selectedAddress.state_province,
          country: selectedAddress.country,
          phone: buyerProfile?.contact_phone || user.phone_number || '',
          email: buyerProfile?.contact_email || user.email || '',
          is_default: selectedAddress.address_id === buyerProfile?.default_delivery_address,
          latitude: selectedAddress.lat || '',
          longitude: selectedAddress.lng || '',
        } : {
          // Default placeholder address when delivery disabled
          first_name: user.name.split(' ')[0] || user.name,
          last_name: user.name.split(' ').slice(1).join(' ') || '',
          address_line1: 'N/A',
          city: 'N/A',
          state_province: 'N/A',
          country: 'N/A',
          phone: user.phone_number || '',
          email: user.email || '',
          is_default: false,
        },
        // Only include delivery_details if delivery enabled
        ...(isDeliveryEnabled ? {
          delivery_details: {
            partner_id: partnerId || '',
            cost: deliveryCost,
          },
          delivery_type_id: deliveryType,
        } : {}),
        payment_details: {
          method: isPaymentsEnabled ? (currentPaymentCategory as string) : 'cash_on_delivery',
          amount: totalWithDelivery,
          currency: 'TZS',
          payment_gateway: isPaymentsEnabled ? 'mobile_money' : 'cash_on_delivery',
        },
        user_id: user.user_id,
      };

      setOrderData(orderData);
    }
  }, [orderId, cart, cartTotals, buyerProfile, deliveryTypes, user, addressId, deliveryType, partnerId, currentPaymentCategory, isPaymentsEnabled, isDeliveryEnabled]);

  // Initialize installment timeline state when order with plan loads
  // MUST be called before any early returns
  useEffect(() => {
    if (order && (order as any).plan && !showInstallmentTimeline && !selectedInstallmentId) {
      setShowInstallmentTimeline(true);
    }
  }, [order, showInstallmentTimeline, selectedInstallmentId]);

  const handleRetryPayment = () => {
    // This is now handled by PaymentForm component
  };

  const handleContinue = () => {
    if (paymentStatus === "completed") {
      // Navigate to orders page - the order will be there whether it was created here or existed before
      router.push("/(buyer)/orders");
    } else {
      router.push("/(buyer)/orders");
    }
  };

  const handleInstallmentPlanCreated = (orderId: string, planId: string) => {
    // Navigate to payment with plan details for first payment
    router.push({
      pathname: "/(buyer)/payment",
      params: {
        orderId: orderId,
        installmentPlanId: planId,
        paymentMethod: "installment",
        returnTo: returnTo || "cart",
        productId: productId || "",
      },
    });
  };

  const handlePaymentCategoryChange = (categoryId: string) => {
    setCurrentPaymentCategory(categoryId);
    setPaymentStatus("idle"); // Reset payment status
  };

  const handleInstallmentPayment = (installmentId: number, amount: number) => {
    setSelectedInstallmentId(installmentId);
    setSelectedInstallmentAmount(amount);
    setShowInstallmentTimeline(false);
  };

  const handleReturnToTimeline = () => {
    setSelectedInstallmentId(null);
    setSelectedInstallmentAmount(0);
    setShowInstallmentTimeline(true);
  };

  // Determine the current flow state
  const getPaymentFlowState = () => {
    // If we have an order with a payment plan
    if (order && (order as any).plan) {
      return "installment_plan";
    }
    
    // If we have an existing order (no plan)
    if (orderId && order) {
      return "existing_order";
    }
    
    // If we're creating an installment plan from cart
    if (currentPaymentCategory === "tunzaa_instalments" && !orderId) {
      return "create_installment_plan";
    }
    
    // If we're making a direct payment from cart
    if (!orderId) {
      return "direct_payment_from_cart";
    }
    
    // Fallback: if we have orderId but no order data yet, assume existing order
    if (orderId) {
      return "existing_order";
    }
    
    return "unknown";
  };

  const paymentFlowState = getPaymentFlowState();

  // Determine what we're loading
  const isLoading = orderId ? orderLoading : (cartLoading || cartTotalsLoading || !orderData);
  const orderToDisplay = order || orderData;

  // When coming from orders page, we only need the order data
  const isOrderPageNavigation = orderId && !cartId && !addressId;
  const shouldShowOrderSummary = !isOrderPageNavigation;

  // Calculate delivery cost
  const selectedDelivery = deliveryTypes?.find(dt => dt.id === deliveryType);
  const deliveryCost = selectedDelivery?.price || 0;

  if (isLoading || (!orderToDisplay && !isOrderPageNavigation)) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={handleBackNavigation}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-semibold text-foreground">{t("payment.checkout")}</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">
            {orderId ? t("payment.loading_order_details") : t("payment.preparing_payment")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // When coming from orders page, we should have order data
  if (isOrderPageNavigation && !order) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={handleBackNavigation}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedThemeColors?.foreground || "#000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">{t("payment.checkout")}</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">{t("payment.loading_order_details")}</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
     <DesktopLayoutWrapper
          showSidebar={false}
          showNavBar={true}
          showFooter={false}
          containerClassName="bg-white"
        >
<SafeAreaView className="flex-1 bg-background">
     {!isDesktop && <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={handleBackNavigation}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedThemeColors?.foreground || "#000"} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">{t("payment.checkout")}</Text>
        <View className="w-6" />
      </View>}

      <ScrollView className="flex-1 p-4 h-full">
        {isDesktop ? (
        <View className={`flex-row mx-auto ${isDesktop ? 'w-[80%]' : ''}`}>
            {/* Left Column - Order Summary */}
            <View className="w-1/2 pr-4">
              {shouldShowOrderSummary && (
                <Card className="mb-6">
                  <TouchableOpacity
                    className="flex-row items-center justify-between p-4"
                    onPress={() => setShowOrderSummary(!showOrderSummary)}
                  >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {t("payment.order_summary")}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-sm text-muted-foreground">
                        {paymentCategoryName} • {cartTotalsLoading ? t("common.loading") : `TShs ${(cartTotals?.total || orderToDisplay?.totals?.total || 0).toLocaleString()}`}
                      </Text>
                    </View>
                      {!orderId && (
                        <Text className="text-xs text-muted-foreground mt-1">
                          {t("payment.tap_to_change_payment")}
                        </Text>
                      )}
                    </View>
                    <ChevronDown 
                      size={20} 
                      className={`text-muted-foreground transition-transform ${showOrderSummary ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </TouchableOpacity>
                  
                  {showOrderSummary && (
                    <View className="border-t border-border">
                      <OrderSummarySection
                        buyerProfile={buyerProfile}
                        selectedAddressId={addressId as string}
                        availableDeliveryTypes={deliveryTypes || []}
                        selectedDeliveryType={deliveryType as string}
                        paymentMethods={PAYMENT_METHODS}
                        selectedPaymentCategory={currentPaymentCategory}
                        cartTotals={cartTotals}
                        totalItemCount={order?.items?.length || cart?.items?.length || 0}
                        onPlaceOrder={() => {}} // Disabled in payment page
                        onPaymentCategorySelect={!orderId ? handlePaymentCategoryChange : () => {}} // Allow editing if no order exists
                        disabled={!!orderId} // Disable interactions if order exists
                        showContinueButton={false}
                        isPaymentsEnabled={isPaymentsEnabled}
                        isDeliveryEnabled={isDeliveryEnabled}
                      />
                    </View>
                  )}
                </Card>
              )}
            </View>
            {/* Right Column - Other Sections */}
            <View className="w-1/2 pl-4">
              {/* Order Payment Info (when coming from orders page) */}
              {isOrderPageNavigation && order && (
                <Card className="mb-6">
                  <View className="p-4">
                    <Text className="text-lg font-semibold text-foreground mb-4">
                      {t("payment.order_payment")}
                    </Text>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-muted-foreground">{t("orders.order_number")}:</Text>
                      <Text className="text-sm font-medium text-foreground">{order.order_number}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-muted-foreground">{t("payment.payment_method")}:</Text>
                      <Text className="text-sm font-medium text-foreground">
                        {getPaymentMethodName(order.payment_details?.method || "mobile_money", t)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-muted-foreground">{t("payment.amount")}:</Text>
                      <Text className="text-lg font-bold text-foreground">
                        TShs {(order.totals?.total || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-muted-foreground">{t("payment.status")}:</Text>
                      <Badge variant={order.payment_status === "completed" ? "default" : "secondary"}>
                        <Text className="text-sm">{order.payment_status?.toUpperCase()}</Text>
                      </Badge>
                    </View>
                  </View>
                </Card>
              )}

              {/* Order Details Accordion */}
              <Card className="mb-6">
                <TouchableOpacity
                  className="flex-row items-center justify-between p-4"
                  onPress={() => setShowOrderDetails(!showOrderDetails)}
                >
                  <View className="flex-row items-center">
                    <Text className="text-lg font-semibold text-foreground">
                      {t("orders.order_details")}
                    </Text>
                    <Text className="text-sm text-muted-foreground ml-2">
                      ({order?.items?.length || cart?.items?.length || 0} {t("orders.items")})
                    </Text>
                  </View>
                  <ChevronDown 
                    size={20} 
                    className={`text-muted-foreground transition-transform ${showOrderDetails ? 'rotate-180' : 'rotate-0'}`}
                  />
                </TouchableOpacity>
                
                {showOrderDetails && (
                  <View className="border-t border-border">
                    {(order?.items || cart?.items || []).length > 0 ? (
                      (order?.items || cart?.items || []).map((item: any, index: number) => (
                        <CartItemDisplay key={item.item_id || item.product_id || index} item={item} index={index} t={t} />
                     ))
                     ) : (
                       <View className="p-4">
                         <Text className="text-sm text-muted-foreground text-center">
                           {t("payment.no_items_found")}
                         </Text>
                       </View>
                     )}
                   </View>
                 )}
              </Card>

              {/* Payment Flow Based on State */}
              {paymentFlowState === "installment_plan" && (
                <>
                  {selectedInstallmentId ? (
                    <PaymentForm
                      orderId={orderId as string}
                      orderNumber={order?.order_number}
                      amount={selectedInstallmentAmount}
                      currency="TZS"
                      paymentCategory="tunzaa"
                      installmentId={selectedInstallmentId || undefined}
                      onPaymentSuccess={(transactionId) => {
                        // console.log("Installment payment successful:", transactionId);
                      }}
                      onPaymentFailure={(error) => {
                        // console.log("Installment payment failed:", error);
                      }}
                      onPaymentTimeout={() => {
                        // console.log("Installment payment timeout");
                      }}
                      onRetry={handleRetryPayment}
                      onContinue={handleReturnToTimeline}
                      showContinueButton={true}
                      continueButtonText={t("payment.back_to_payment_plan")}
                    />
                  ) : (
                    <InstallmentTimeline
                      plan={(order as any).plan}
                      onMakePayment={handleInstallmentPayment}
                    />
                  )}
                </>
              )}

              {paymentFlowState === "existing_order" && (
                <>
                  {/* Show retry payment information */}
                  {isOrderPageNavigation && order?.payment_status !== "completed" && (
                    <Card className="mb-6">
                      <View className="p-4">
                        <Text className="text-lg font-semibold text-foreground mb-2">
                          {t("payment.complete_payment")}
                        </Text>
                        <Text className="text-sm text-muted-foreground mb-4">
                          {t("payment.order_ready_payment")}
                        </Text>
                        {order?.payment_status === "failed" && (
                          <View className="p-3 bg-destructive/10 border border-destructive rounded-lg mb-4">
                            <Text className="text-sm text-destructive">
                              {t("payment.previous_payment_failed")}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  )}

                  <PaymentForm
                    orderId={orderId as string}
                    orderNumber={order?.order_number}
                    amount={order?.totals?.total || order?.payment_details?.amount || 0}
                    currency="TZS"
                    paymentCategory={order?.payment_details?.method || currentPaymentCategory}
                    onPaymentSuccess={(transactionId) => {
                      // console.log("Payment successful:", transactionId);
                    }}
                    onPaymentFailure={(error) => {
                      // console.log("Payment failed:", error);
                    }}
                    onPaymentTimeout={() => {
                      // console.log("Payment timeout");
                    }}
                    onRetry={handleRetryPayment}
                    onContinue={handleContinue}
                    showContinueButton={true}
                    continueButtonText={paymentStatus === "completed" ? t("payment.view_order_details") : t("payment.go_to_orders")}
                  />
                </>
              )}

              {paymentFlowState === "create_installment_plan" && (
                <InstallmentPlanCreator
                  cartId={cartId as string}
                  addressId={addressId as string}
                  deliveryType={deliveryType as string}
                  vehicleId={vehicleId as string}
                  partnerId={partnerId as string}
                  deliveryCost={deliveryCost}
                  totalAmount={(cartTotals?.total || 0) + deliveryCost}
                  onPlanCreated={handleInstallmentPlanCreated}
                />
              )}

              {paymentFlowState === "direct_payment_from_cart" && (
                <PaymentForm
                  orderId={orderId as string}
                  orderNumber={order?.order_number || orderData?.order_number}
                  amount={
                    order?.totals?.total || 
                    (cartTotals ? cartTotals.total + deliveryCost : 0) || 
                    orderData?.payment_details?.amount || 
                    0
                  }
                  currency="TZS"
                  paymentCategory={isPaymentsEnabled ? currentPaymentCategory : "cash_on_delivery"}
                  createOrderData={!orderId ? orderData : undefined}
                  isPaymentsEnabled={isPaymentsEnabled}
                  onPaymentSuccess={(transactionId) => {
                    // console.log("Payment successful:", transactionId);
                  }}
                  onPaymentFailure={(error) => {
                    // console.log("Payment failed:", error);
                  }}
                  onPaymentTimeout={() => {
                    // console.log("Payment timeout");
                  }}
                  onRetry={handleRetryPayment}
                  onContinue={handleContinue}
                  showContinueButton={true}
                  continueButtonText={paymentStatus === "completed" ? t("payment.view_order_details") : t("payment.go_to_orders")}
                />
              )}

              {paymentFlowState === "unknown" && (
                <Card className="mb-6">
                  <View className="p-4">
                    <Text className="text-lg font-semibold text-foreground mb-2">
                      {t("payment.payment_setup")}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {t("payment.setting_up_payment")}
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          </View>
        ) : (
          <>
            {/* Order Summary Section */}
            {shouldShowOrderSummary && (
              <Card className="mb-6">
                <TouchableOpacity
                  className="flex-row items-center justify-between p-4"
                  onPress={() => setShowOrderSummary(!showOrderSummary)}
                >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {t("payment.order_summary")}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-sm text-muted-foreground">
                        {paymentCategoryName} • {cartTotalsLoading ? t("common.loading") : `TShs ${(cartTotals?.total || orderToDisplay?.totals?.total || 0).toLocaleString()}`}
                      </Text>
                    </View>
                    {!orderId && (
                      <Text className="text-xs text-muted-foreground mt-1">
                        {t("payment.tap_to_change_payment")}
                      </Text>
                    )}
                  </View>
                  <ChevronDown 
                    size={20} 
                    className={`text-muted-foreground transition-transform ${showOrderSummary ? 'rotate-180' : 'rotate-0'}`}
                  />
                </TouchableOpacity>
                
                {showOrderSummary && (
                  <View className="border-t border-border">
                    <OrderSummarySection
                      buyerProfile={buyerProfile}
                      selectedAddressId={addressId as string}
                      availableDeliveryTypes={deliveryTypes || []}
                      selectedDeliveryType={deliveryType as string}
                      paymentMethods={PAYMENT_METHODS}
                      selectedPaymentCategory={currentPaymentCategory}
                      cartTotals={cartTotals}
                      totalItemCount={order?.items?.length || cart?.items?.length || 0}
                      onPlaceOrder={() => {}} // Disabled in payment page
                      onPaymentCategorySelect={!orderId ? handlePaymentCategoryChange : () => {}} // Allow editing if no order exists
                      disabled={!!orderId} // Disable interactions if order exists
                      showContinueButton={false}
                    />
                  </View>
                )}
              </Card>
            )}

            {/* Order Payment Info (when coming from orders page) */}
            {isOrderPageNavigation && order && (
              <Card className="mb-6">
                <View className="p-4">
                  <Text className="text-lg font-semibold text-foreground mb-4">
                    {t("payment.order_payment")}
                  </Text>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-muted-foreground">{t("orders.order_number")}:</Text>
                    <Text className="text-sm font-medium text-foreground">{order.order_number}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-muted-foreground">{t("payment.payment_method")}:</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {getPaymentMethodName(order.payment_details?.method || "mobile_money", t)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-muted-foreground">{t("payment.amount")}:</Text>
                    <Text className="text-lg font-bold text-foreground">
                      TShs {(order.totals?.total || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted-foreground">{t("payment.status")}:</Text>
                    <Badge variant={order.payment_status === "completed" ? "default" : "secondary"}>
                      <Text className="text-sm">{order.payment_status?.toUpperCase()}</Text>
                    </Badge>
                  </View>
                </View>
              </Card>
            )}

            {/* Order Details Accordion */}
            <Card className="mb-6">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => setShowOrderDetails(!showOrderDetails)}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-foreground">
                    {t("orders.order_details")}
                  </Text>
                  <Text className="text-sm text-muted-foreground ml-2">
                    ({order?.items?.length || cart?.items?.length || 0} {t("orders.items")})
                  </Text>
                </View>
                <ChevronDown 
                  size={20} 
                  className={`text-muted-foreground transition-transform ${showOrderDetails ? 'rotate-180' : 'rotate-0'}`}
                />
              </TouchableOpacity>
              
              {showOrderDetails && (
                <View className="border-t border-border">
                  {(order?.items || cart?.items || []).length > 0 ? (
                    (order?.items || cart?.items || []).map((item: any, index: number) => (
                      <CartItemDisplay key={item.item_id || item.product_id || index} item={item} index={index} t={t} />
                   ))
                   ) : (
                     <View className="p-4">
                       <Text className="text-sm text-muted-foreground text-center">
                         {t("payment.no_items_found")}
                       </Text>
                     </View>
                   )}
                 </View>
               )}
            </Card>

            {/* Payment Flow Based on State */}
            {paymentFlowState === "installment_plan" && (
              <>
                {selectedInstallmentId ? (
                  <PaymentForm
                    orderId={orderId as string}
                    orderNumber={order?.order_number}
                    amount={selectedInstallmentAmount}
                    currency="TZS"
                    paymentCategory="tunzaa"
                    installmentId={selectedInstallmentId || undefined}
                    onPaymentSuccess={(transactionId) => {
                      // console.log("Installment payment successful:", transactionId);
                    }}
                    onPaymentFailure={(error) => {
                      // console.log("Installment payment failed:", error);
                    }}
                    onPaymentTimeout={() => {
                      // console.log("Installment payment timeout");
                    }}
                    onRetry={handleRetryPayment}
                    onContinue={handleReturnToTimeline}
                    showContinueButton={true}
                    continueButtonText={t("payment.back_to_payment_plan")}
                  />
                ) : (
                  <InstallmentTimeline
                    plan={(order as any).plan}
                    onMakePayment={handleInstallmentPayment}
                  />
                )}
              </>
            )}

            {paymentFlowState === "existing_order" && (
              <>
                {/* Show retry payment information */}
                {isOrderPageNavigation && order?.payment_status !== "completed" && (
                  <Card className="mb-6">
                    <View className="p-4">
                      <Text className="text-lg font-semibold text-foreground mb-2">
                        {t("payment.complete_payment")}
                      </Text>
                      <Text className="text-sm text-muted-foreground mb-4">
                        {t("payment.order_ready_payment")}
                      </Text>
                      {order?.payment_status === "failed" && (
                        <View className="p-3 bg-destructive/10 border border-destructive rounded-lg mb-4">
                          <Text className="text-sm text-destructive">
                            {t("payment.previous_payment_failed")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                )}

                <PaymentForm
                  orderId={orderId as string}
                  orderNumber={order?.order_number}
                  amount={order?.totals?.total || order?.payment_details?.amount || 0}
                  currency="TZS"
                  paymentCategory={order?.payment_details?.method || currentPaymentCategory}
                  onPaymentSuccess={(transactionId) => {
                    // console.log("Payment successful:", transactionId);
                  }}
                  onPaymentFailure={(error) => {
                    // console.log("Payment failed:", error);
                  }}
                  onPaymentTimeout={() => {
                    // console.log("Payment timeout");
                  }}
                  onRetry={handleRetryPayment}
                  onContinue={handleContinue}
                  showContinueButton={true}
                  continueButtonText={paymentStatus === "completed" ? t("payment.view_order_details") : t("payment.go_to_orders")}
                />
              </>
            )}

            {paymentFlowState === "create_installment_plan" && (
              <InstallmentPlanCreator
                cartId={cartId as string}
                addressId={addressId as string}
                deliveryType={deliveryType as string}
                vehicleId={vehicleId as string}
                partnerId={partnerId as string}
                deliveryCost={deliveryCost}
                totalAmount={(cartTotals?.total || 0) + deliveryCost}
                onPlanCreated={handleInstallmentPlanCreated}
              />
            )}

            {paymentFlowState === "direct_payment_from_cart" && (
              <PaymentForm
                orderId={orderId as string}
                orderNumber={order?.order_number || orderData?.order_number}
                amount={
                  order?.totals?.total || 
                  (cartTotals ? cartTotals.total + deliveryCost : 0) || 
                  orderData?.payment_details?.amount || 
                  0
                }
                currency="TZS"
                paymentCategory={isPaymentsEnabled ? currentPaymentCategory : "cash_on_delivery"}
                createOrderData={!orderId ? orderData : undefined}
                isPaymentsEnabled={isPaymentsEnabled}
                onPaymentSuccess={(transactionId) => {
                  // console.log("Payment successful:", transactionId);
                }}
                onPaymentFailure={(error) => {
                  // console.log("Payment failed:", error);
                }}
                onPaymentTimeout={() => {
                  // console.log("Payment timeout");
                }}
                onRetry={handleRetryPayment}
                onContinue={handleContinue}
                showContinueButton={true}
                continueButtonText={paymentStatus === "completed" ? t("payment.view_order_details") : t("payment.go_to_orders")}
              />
            )}

            {paymentFlowState === "unknown" && (
              <Card className="mb-6">
                <View className="p-4">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    {t("payment.payment_setup")}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {t("payment.setting_up_payment")}
                  </Text>
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
        </DesktopLayoutWrapper>
  );
};

export default PaymentScreen;

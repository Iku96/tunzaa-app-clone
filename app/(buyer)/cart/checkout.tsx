import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Plus,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useCartCombined, useCartTotals } from "@/stores/cart";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import {
  useDeliveryTypesWithFallback,
  useGetDeliveryPartners,
} from "@/src/services/delivery";
import { useGetVehicleTypes } from "@/src/services/configuration";
import { useProductById } from "@/stores/products";
import { AddressModal } from "@/components/modals/AddressModal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "@/lib/icons/Terminal";
import { getImageUrl } from "@/utils/images";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { SimilarItems } from "@/components/recommendations";
import { useI18n } from "@/hooks/useI18n";
import type {
  DeliveryAddress,
  UpdateBuyerProfileBody,
} from "@/src/services/types/buyers";
import type { DeliveryPartner, VehicleType } from "@/src/services/types";
import { API_CONFIG } from "@/src/services/config";
import {
  CheckoutStepHeader,
  CheckoutStep,
  OrderOverviewSection,
  DeliveryAddressSection,
  DeliveryOptionsSection,
  DeliveryDetailsSection,
  PaymentMethodSection,
  OrderSummarySection,
} from "@/components/checkout";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { QRCodeIcon, CashOnDeliveryIcon } from "@/components/icons/payment";
import { PAYMENT_METHODS } from "@/config/payment-methods";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTenantModules } from "@/hooks/useTenantModules";

const CheckoutScreen = () => {
  const router = useRouter();
  const { returnTo, productId } = useLocalSearchParams();
  const { user } = useAuth();
  const cart = useCartCombined(user?.user_id ?? "");
  const { isDesktop } = useResponsive();
  const { t } = useI18n();

  // Tenant modules
  const { isPaymentsEnabled, isDeliveryEnabled } = useTenantModules();

  // Theme colors
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();

  // Get cart totals
  const { data: cartTotals, isLoading: cartTotalsLoading } = useCartTotals(cart.cart?.cart_id ?? "");

  // ScrollView ref for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  usePageTitle("Checkout");
  // Refs for each card section
  const orderOverviewRef = useRef<View>(null);
  const deliveryAddressRef = useRef<View>(null);
  const deliveryOptionsRef = useRef<View>(null);
  const deliveryDetailsRef = useRef<View>(null);
  const orderSummaryRef = useRef<View>(null);
  const similarItemsRef = useRef<View>(null);

  // Focus state
  const [focusedCard, setFocusedCard] = useState<CheckoutStep | null>(null);

  // Log cart totals when they change
  useEffect(() => {
    if (cartTotals) {
    }
  }, [cartTotals]);

  // Checkout state
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Cart restoration state
  const [isRestoringCart, setIsRestoringCart] = useState(false);

  // Force server fetch when checkout page loads
  useEffect(() => {
    if (user?.user_id) {
      cart.refetch();
    }
  }, [user?.user_id, cart.refetch]);

  // Log cart changes after fetch
  useEffect(() => {
    if (cart.cart && !cart.isLoading) {
      // console.log('Cart updated after server fetch:', {
      //   cartId: cart.cart.cart_id,
      //   itemCount: cart.cart.items.length,
      //   items: cart.cart.items.map(item => ({
      //     productId: item.product_id,
      //     quantity: item.quantity,
      //     sku: item.metadata?.sku
      //   }))
      // });
    }
  }, [cart.cart, cart.isLoading]);

  // Address management hook
  const {
    buyerProfile,
    profileLoading,
    isSubmitting: addressSubmitting,
    error: addressError,
    setError: setAddressError,
    handleAddressSubmit,
  } = useAddressManagement({
    onSuccess: (newAddress) => {
      if (
        newAddress.address_id &&
        (newAddress.address_id === buyerProfile?.default_delivery_address ||
          buyerProfile?.delivery_address.length === 1)
      ) {
        setSelectedAddressId(newAddress.address_id);
      }
    },
    onError: (errorMsg) => setError(errorMsg),
  });
  const { data: deliveryTypes, isUsingFallback } = useDeliveryTypesWithFallback();
  

  // Pre-fetch vehicle types and partners
  const { data: vehicleTypes } = useGetVehicleTypes(
    { tenant_id: API_CONFIG.TENANT_ID },
    true
  );
  const { data: partners } = useGetDeliveryPartners(
    { partner_type: "business" },
    true
  );

  // Use delivery types with fallback
  const availableDeliveryTypes = deliveryTypes || [];

  // Log when using fallback delivery types
  useEffect(() => {
    if (isUsingFallback) {
      // console.log('Using fallback delivery types - API may be unavailable');
    }
  }, [isUsingFallback]);

  // Helper function to determine if a step is completed
  const isStepCompleted = (step: CheckoutStep): boolean => {
    switch (step) {
      case CheckoutStep.ORDER_OVERVIEW:
        return cart.hasItems() && !cart.isLoading && !cartTotalsLoading;
      case CheckoutStep.DELIVERY_ADDRESS:
        // Skip if delivery module disabled
        if (!isDeliveryEnabled) return true;
        return !!selectedAddressId;
      case CheckoutStep.DELIVERY_OPTIONS:
        // Skip if delivery module disabled
        if (!isDeliveryEnabled) return true;
        return !!selectedDeliveryType;
      case CheckoutStep.ORDER_SUMMARY:
        // If payments disabled, auto-select pay_on_delivery
        if (!isPaymentsEnabled) return true;
        return !!selectedPaymentCategory;
      default:
        return false;
    }
  };

  // Helper function to determine if a step is accessible
  const isStepAccessible = (step: CheckoutStep): boolean => {
    switch (step) {
      case CheckoutStep.ORDER_OVERVIEW:
        return true;
      case CheckoutStep.DELIVERY_ADDRESS:
        // Skip if delivery module disabled
        if (!isDeliveryEnabled) return false;
        return isStepCompleted(CheckoutStep.ORDER_OVERVIEW);
      case CheckoutStep.DELIVERY_OPTIONS:
        // Skip if delivery module disabled
        if (!isDeliveryEnabled) return false;
        return isStepCompleted(CheckoutStep.DELIVERY_ADDRESS);
      case CheckoutStep.ORDER_SUMMARY:
        // If delivery disabled, accessible after order overview
        if (!isDeliveryEnabled) return isStepCompleted(CheckoutStep.ORDER_OVERVIEW);
        return isStepCompleted(CheckoutStep.DELIVERY_OPTIONS);
      default:
        return false;
    }
  };

  // Function to scroll to a specific card
  const scrollToCard = useCallback((step: CheckoutStep, delay: number = 500) => {
    setTimeout(() => {
      let targetRef: any = null;

      switch (step) {
        case CheckoutStep.ORDER_OVERVIEW:
          targetRef = orderOverviewRef;
          break;
        case CheckoutStep.DELIVERY_ADDRESS:
          targetRef = deliveryAddressRef;
          break;
        case CheckoutStep.DELIVERY_OPTIONS:
          targetRef = deliveryOptionsRef;
          break;
        case CheckoutStep.DELIVERY_DETAILS:
          targetRef = deliveryDetailsRef;
          break;
        case CheckoutStep.ORDER_SUMMARY:
          targetRef = orderSummaryRef;
          break;
        default:
          targetRef = similarItemsRef; // For SimilarItems
      }

      if (targetRef?.current && scrollViewRef.current) {
        targetRef.current.measureLayout(
          scrollViewRef.current as any,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 100),
              animated: true,
            });
          },
          () => {
            // console.log('Failed to measure layout for', step);
          }
        );
      }
    }, delay);
  }, []);

  // Function to focus on the next incomplete step
  const focusNextIncompleteStep = useCallback(() => {
    if (!cart.hasItems()) {
      setFocusedCard(CheckoutStep.ORDER_OVERVIEW);
      scrollToCard(CheckoutStep.ORDER_OVERVIEW, 100);
      return;
    }

    // Skip delivery steps if delivery module disabled
    if (isDeliveryEnabled) {
      if (!selectedAddressId && isStepAccessible(CheckoutStep.DELIVERY_ADDRESS)) {
        setFocusedCard(CheckoutStep.DELIVERY_ADDRESS);
        scrollToCard(CheckoutStep.DELIVERY_ADDRESS, 100);
        return;
      }

      if (!selectedDeliveryType && isStepAccessible(CheckoutStep.DELIVERY_OPTIONS)) {
        setFocusedCard(CheckoutStep.DELIVERY_OPTIONS);
        scrollToCard(CheckoutStep.DELIVERY_OPTIONS, 100);
        return;
      }
    }

    // Skip payment selection if payments module disabled
    if (isPaymentsEnabled && !selectedPaymentCategory && isStepAccessible(CheckoutStep.ORDER_SUMMARY)) {
      setFocusedCard(CheckoutStep.ORDER_SUMMARY);
      scrollToCard(CheckoutStep.ORDER_SUMMARY, 100);
      return;
    }

    setFocusedCard(CheckoutStep.ORDER_SUMMARY);
    scrollToCard(CheckoutStep.ORDER_SUMMARY, 100);
  }, [cart.hasItems(), selectedAddressId, selectedDeliveryType, selectedPaymentCategory, isStepAccessible, scrollToCard, isDeliveryEnabled, isPaymentsEnabled]);

  // Auto-focus when cart loads
  useEffect(() => {
    if (cart.cart && !cart.isLoading) {
      focusNextIncompleteStep();
    }
  }, [cart.cart, cart.isLoading, focusNextIncompleteStep]);

  // Auto-focus when selections change
  useEffect(() => {
    if (cart.hasItems()) {
      focusNextIncompleteStep();
    }
  }, [selectedAddressId, selectedDeliveryType, selectedPaymentCategory, focusNextIncompleteStep]);

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  // Handle delivery type selection
  const handleDeliveryTypeSelect = (deliveryType: string) => {
    setSelectedDeliveryType(deliveryType);
    setSelectedVehicle("");
    setSelectedPartner("");
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  };

  // Handle partner selection
  const handlePartnerSelect = (partnerId: string) => {
    setSelectedPartner(partnerId);
  };

  // Handle payment category selection
  const handlePaymentCategorySelect = (categoryId: string) => {
    setSelectedPaymentCategory(categoryId);
    setSelectedPaymentMethod("tunzaa");
  };

  const handleAddressModalSubmit = async (address: any) => {
    await handleAddressSubmit(address);
    setShowAddressModal(false);
    setSelectedAddress(null);
  };

  const handleContinueToPayment = async () => {
    // Validate delivery steps only if delivery module enabled
    if (isDeliveryEnabled) {
      if (!selectedAddressId || !selectedDeliveryType) {
        setError("Please complete all checkout steps");
        return;
      }

      // Safely check for delivery_address array before accessing
      if (!buyerProfile?.delivery_address || !Array.isArray(buyerProfile.delivery_address)) {
        setError("Please select a delivery address");
        return;
      }

      const selectedAddressData = buyerProfile.delivery_address.find(
        (addr) => addr.address_id === selectedAddressId
      );

      if (!selectedAddressData) {
        setError("Please select a delivery address");
        return;
      }
    }

    // Validate payment only if payments module enabled
    if (isPaymentsEnabled && !selectedPaymentCategory) {
      setError("Please select a payment method");
      return;
    }

    router.push({
      pathname: "/(buyer)/payment",
      params: {
        cartId: cart.cart?.cart_id || "",
        paymentMethod: isPaymentsEnabled ? selectedPaymentCategory : "cash_on_delivery",
        addressId: isDeliveryEnabled ? selectedAddressId : "",
        deliveryType: isDeliveryEnabled ? selectedDeliveryType : "",
        vehicleId: isDeliveryEnabled ? (selectedVehicle || "") : "",
        partnerId: isDeliveryEnabled ? (selectedPartner || "") : "",
        returnTo: returnTo || "cart",
        productId: productId || "",
      },
    });
  };

  // Handle cart restoration
  const handleCartRestoration = useCallback(async () => {
    const tempCart = cart.getTempCart();
    if (tempCart?.cart) {
      try {
        setIsRestoringCart(true);
        // console.log('Restoring original cart from checkout...');
        await cart.restoreOriginalCart();
        // console.log('Original cart restored successfully');
      } catch (error) {
        console.error('Failed to restore original cart:', error);
        setError('Failed to restore your original cart. Please check your cart manually.');
      } finally {
        setIsRestoringCart(false);
      }
    }
  }, [cart]);

  // Handle back navigation
  const handleBackNavigation = async () => {
    const tempCart = cart.getTempCart();
    if (tempCart?.cart) {
      await handleCartRestoration();
    }

    if (returnTo === "product" && productId) {
      router.push(`/(buyer)/product/${productId}`);
    } else if (returnTo === "cart") {
      router.push("/(buyer)/cart");
    } else {
      router.back();
    }
  };

  // Restore cart on unmount
  useFocusEffect(
    useCallback(() => {
      return () => {
        const tempCart = cart.getTempCart();
        if (tempCart?.cart) {
          // console.log('Checkout screen lost focus, restoring cart...');
          handleCartRestoration();
        }
      };
    }, [handleCartRestoration])
  );

  // Redirect to cart if empty and no progress
  const shouldRedirectToCart = !cart.hasItems() &&
    !cart.isLoading &&
    !selectedAddressId &&
    !selectedDeliveryType &&
    !selectedPaymentCategory &&
    !cart.getTempCart();

  if (shouldRedirectToCart) {
    router.replace("/(buyer)/cart");
    return null;
  }

  // Loading state
  if (cart.isLoading) {
    const resolvedColors = useResolvedThemeColors();
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Checkout</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground">Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Cart validation
  const hasCheckoutProgress = selectedAddressId || selectedDeliveryType || selectedPaymentCategory;
  const hasTempCart = cart.getTempCart();

  if (!cart.cart || !cart.cart.cart_id || cart.cart.items.length === 0) {
    if (hasCheckoutProgress || hasTempCart) {
      return (
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          <View className="flex-row justify-between items-center p-4 border-b border-border">
            <TouchableOpacity onPress={handleBackNavigation}>
              <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Checkout</Text>
            <View className="w-6" />
          </View>
          <View className="flex-1 justify-center items-center p-4">
            <Alert icon={Terminal} variant="default" className="mb-4">
              <Text className="text-sm text-foreground">
                Your cart appears to be empty. This might happen if your order is being processed or if there was a connection issue.
              </Text>
            </Alert>
            <View className="flex-row space-x-2">
              <Button variant="outline" onPress={() => cart.refetch()}>
                <Text>Refresh Cart</Text>
              </Button>
              <Button onPress={handleBackNavigation}>
                <Text>Go Back</Text>
              </Button>
            </View>
          </View>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          <View className="flex-row justify-between items-center p-4 border-b border-border">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Checkout</Text>
            <View className="w-6" />
          </View>
          <View className="flex-1 justify-center items-center p-4">
            <Alert icon={Terminal} variant="destructive" className="mb-4">
              <Text className="text-sm text-destructive">
                Invalid cart data. Please return to your cart and try again.
              </Text>
            </Alert>
            <Button onPress={() => router.push("/(buyer)/cart")}>
              <Text>Go to Cart</Text>
            </Button>
          </View>
        </SafeAreaView>
      );
    }
  }

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={false}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-background">
        <View
  className={`${isDesktop ? 'w-[80%]' : ''} max-w-7xl mx-auto bg-white`}>
          {!isDesktop && (
            <View className="flex-row justify-between items-center mb-4">
              <Button
                variant="ghost"
                size="icon"
                onPress={handleBackNavigation}
              >
                <ArrowLeft size={24} className="text-foreground" />
              </Button>
              <Text className="text-lg font-semibold text-foreground">Checkout</Text>
              <View className="w-6" />
            </View>
          )}
          {error && (
            <Alert icon={Terminal} variant="destructive" className="mb-4">
              <Text className="text-sm text-destructive">{error}</Text>
            </Alert>
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              ref={scrollViewRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {isDesktop ? (
                <View className="flex-row">
      {/* Left Column - Order Overview */}
      <View className="w-1/2 pr-4">
        <View ref={orderOverviewRef}>
          <Card className="m-4">
            <CheckoutStepHeader
              step={CheckoutStep.ORDER_OVERVIEW}
              title="Order Overview"
              icon={ShoppingBag}
              activeStep={CheckoutStep.ORDER_OVERVIEW}
              isCompleted={isStepCompleted(CheckoutStep.ORDER_OVERVIEW)}
              onPress={() => {}}
              disabled={true}
            />
            <OrderOverviewSection
              cartItems={cart.cart?.items.map((item) => ({
                ...item,
                variant_id: item.variant_id || undefined,
              })) || []}
              optimisticItems={cart.optimisticItems}
              cartTotals={cartTotals}
              totalItemCount={cart.getTotalItemCount()}
              onContinue={() => {}}
              isLoading={cart.isLoading || cartTotalsLoading}
            />
            {(!cart.hasItems() && hasCheckoutProgress) && (
              <View className="p-4 border-t border-border bg-yellow-50">
                <Text className="text-sm text-yellow-800 text-center">
                  Your cart appears empty. This may happen during order processing.
                </Text>
              </View>
            )}
          </Card>
        </View>
      </View>
      {/* Right Column - Other Steps */}
      <View className="w-1/2 pl-4">
        {/* Delivery Address Section - only show if delivery enabled */}
        {isDeliveryEnabled && (
        <View ref={deliveryAddressRef}>
          <Card className={`m-4 ${!isStepAccessible(CheckoutStep.DELIVERY_ADDRESS) ? 'opacity-50' : ''}`}>
            <CheckoutStepHeader
              step={CheckoutStep.DELIVERY_ADDRESS}
              title="Delivery Address"
              icon={MapPin}
              activeStep={CheckoutStep.DELIVERY_ADDRESS}
              isCompleted={isStepCompleted(CheckoutStep.DELIVERY_ADDRESS)}
              onPress={() => {}}
              disabled={!isStepAccessible(CheckoutStep.DELIVERY_ADDRESS)}
            />
            {isStepAccessible(CheckoutStep.DELIVERY_ADDRESS) ? (
              <DeliveryAddressSection
                buyerProfile={buyerProfile as any}
                selectedAddressId={selectedAddressId}
                profileLoading={profileLoading}
                onAddressSelect={handleAddressSelect}
                onAddNewAddress={() => setShowAddressModal(true)}
              />
            ) : (
              <View className="p-4 border-t border-border">
                <Text className="text-sm text-muted-foreground text-center">
                  Please complete the order overview first
                </Text>
              </View>
            )}
          </Card>
        </View>
        )}
        {/* Delivery Options Section - only show if delivery enabled */}
        {isDeliveryEnabled && (
        <View ref={deliveryOptionsRef}>
          <Card className={`m-4 ${!isStepAccessible(CheckoutStep.DELIVERY_OPTIONS) ? 'opacity-50' : ''}`}>
            <CheckoutStepHeader
              step={CheckoutStep.DELIVERY_OPTIONS}
              title="Delivery Options"
              icon={Truck}
              activeStep={CheckoutStep.DELIVERY_OPTIONS}
              isCompleted={isStepCompleted(CheckoutStep.DELIVERY_OPTIONS)}
              onPress={() => {}}
              disabled={!isStepAccessible(CheckoutStep.DELIVERY_OPTIONS)}
            />
            {isStepAccessible(CheckoutStep.DELIVERY_OPTIONS) ? (
              <>
                {isUsingFallback && (
                  <View className="p-3 bg-yellow-50 border-b border-yellow-200">
                    <Text className="text-xs text-yellow-800 text-center">
                      Using default delivery options
                    </Text>
                  </View>
                )}
                <DeliveryOptionsSection
                  availableDeliveryTypes={availableDeliveryTypes}
                  selectedDeliveryType={selectedDeliveryType}
                  onDeliveryTypeSelect={handleDeliveryTypeSelect}
                />
              </>
            ) : (
              <View className="p-4 border-t border-border">
                <Text className="text-sm text-muted-foreground text-center">
                  Please select a delivery address first
                </Text>
              </View>
            )}
          </Card>
        </View>
        )}
        <View ref={orderSummaryRef}>
          <Card className={`m-4 ${!isStepAccessible(CheckoutStep.ORDER_SUMMARY) ? 'opacity-50' : ''}`}>
            <CheckoutStepHeader
              step={CheckoutStep.ORDER_SUMMARY}
              title="Final Review"
              icon={ShoppingBag}
              activeStep={CheckoutStep.ORDER_SUMMARY}
              isCompleted={isStepCompleted(CheckoutStep.ORDER_SUMMARY)}
              onPress={() => {}}
              disabled={!isStepAccessible(CheckoutStep.ORDER_SUMMARY)}
            />
            {isStepAccessible(CheckoutStep.ORDER_SUMMARY) ? (
              <OrderSummarySection
                buyerProfile={buyerProfile}
                selectedAddressId={selectedAddressId}
                availableDeliveryTypes={availableDeliveryTypes}
                selectedDeliveryType={selectedDeliveryType}
                paymentMethods={PAYMENT_METHODS}
                selectedPaymentCategory={selectedPaymentCategory}
                cartTotals={cartTotals}
                totalItemCount={cart.getTotalItemCount()}
                onPlaceOrder={handleContinueToPayment}
                onPaymentCategorySelect={handlePaymentCategorySelect}
                isPaymentsEnabled={isPaymentsEnabled}
                isDeliveryEnabled={isDeliveryEnabled}
              />
            ) : (
              <View className="p-4 border-t border-border">
                <Text className="text-sm text-muted-foreground text-center">
                  {isDeliveryEnabled ? "Please select delivery options first" : "Please select a payment method"}
                </Text>
              </View>
            )}
          </Card>
        </View>
        <View ref={similarItemsRef} className="m-4">
          <View className="px-4 max-w-7xl mx-auto">
            <SimilarItems
              productId={productId as string}
              categoryId={cart.cart?.items[0]?.metadata?.category_id}
              count={6}
              title="You May Also Like"
            />
          </View>
        </View>
      </View>
    </View>
              ) : (
                <>
                  {/* Order Overview Section */}
                  <View ref={orderOverviewRef}>
                    <Card className="m-4">
                      <CheckoutStepHeader
                        step={CheckoutStep.ORDER_OVERVIEW}
                        title="Order Overview"
                        icon={ShoppingBag}
                        activeStep={CheckoutStep.ORDER_OVERVIEW}
                        isCompleted={isStepCompleted(CheckoutStep.ORDER_OVERVIEW)}
                        onPress={() => {}}
                        disabled={true}
                      />
                      <OrderOverviewSection
                        cartItems={cart.cart?.items.map((item) => ({
                          ...item,
                          variant_id: item.variant_id || undefined,
                        })) || []}
                        optimisticItems={cart.optimisticItems}
                        cartTotals={cartTotals}
                        totalItemCount={cart.getTotalItemCount()}
                        onContinue={() => {}}
                        isLoading={cart.isLoading || cartTotalsLoading}
                      />
                      {(!cart.hasItems() && hasCheckoutProgress) && (
                        <View className="p-4 border-t border-border bg-yellow-50">
                          <Text className="text-sm text-yellow-800 text-center">
                            Your cart appears empty. This may happen during order processing.
                          </Text>
                        </View>
                      )}
                    </Card>
                  </View>
                  {/* Delivery Address Section - only show if delivery enabled */}
                  {isDeliveryEnabled && (
                  <View ref={deliveryAddressRef}>
                    <Card className={`m-4 ${!isStepAccessible(CheckoutStep.DELIVERY_ADDRESS) ? 'opacity-50' : ''}`}>
                      <CheckoutStepHeader
                        step={CheckoutStep.DELIVERY_ADDRESS}
                        title="Delivery Address"
                        icon={MapPin}
                        activeStep={CheckoutStep.DELIVERY_ADDRESS}
                        isCompleted={isStepCompleted(CheckoutStep.DELIVERY_ADDRESS)}
                        onPress={() => {}}
                        disabled={!isStepAccessible(CheckoutStep.DELIVERY_ADDRESS)}
                      />
                      {isStepAccessible(CheckoutStep.DELIVERY_ADDRESS) ? (
                        <DeliveryAddressSection
                          buyerProfile={buyerProfile as any}
                          selectedAddressId={selectedAddressId}
                          profileLoading={profileLoading}
                          onAddressSelect={handleAddressSelect}
                          onAddNewAddress={() => setShowAddressModal(true)}
                        />
                      ) : (
                        <View className="p-4 border-t border-border">
                          <Text className="text-sm text-muted-foreground text-center">
                            Please complete the order overview first
                          </Text>
                        </View>
                      )}
                    </Card>
                  </View>
                  )}
                  {/* Delivery Options Section - only show if delivery enabled */}
                  {isDeliveryEnabled && (
                  <View ref={deliveryOptionsRef}>
                    <Card className={`m-4 ${!isStepAccessible(CheckoutStep.DELIVERY_OPTIONS) ? 'opacity-50' : ''}`}>
                      <CheckoutStepHeader
                        step={CheckoutStep.DELIVERY_OPTIONS}
                        title="Delivery Options"
                        icon={Truck}
                        activeStep={CheckoutStep.DELIVERY_OPTIONS}
                        isCompleted={isStepCompleted(CheckoutStep.DELIVERY_OPTIONS)}
                        onPress={() => {}}
                        disabled={!isStepAccessible(CheckoutStep.DELIVERY_OPTIONS)}
                      />
                      {isStepAccessible(CheckoutStep.DELIVERY_OPTIONS) ? (
                        <>
                          {isUsingFallback && (
                            <View className="p-3 bg-yellow-50 border-b border-yellow-200">
                              <Text className="text-xs text-yellow-800 text-center">
                                Using default delivery options
                              </Text>
                            </View>
                          )}
                          <DeliveryOptionsSection
                            availableDeliveryTypes={availableDeliveryTypes}
                            selectedDeliveryType={selectedDeliveryType}
                            onDeliveryTypeSelect={handleDeliveryTypeSelect}
                          />
                        </>
                      ) : (
                        <View className="p-4 border-t border-border">
                          <Text className="text-sm text-muted-foreground text-center">
                            Please select a delivery address first
                          </Text>
                        </View>
                      )}
                    </Card>
                  </View>
                  )}
                  {/* Order Summary Section */}
                  <View ref={orderSummaryRef}>
                    <Card className={`m-4 ${!isStepAccessible(CheckoutStep.ORDER_SUMMARY) ? 'opacity-50' : ''}`}>
                      <CheckoutStepHeader
                        step={CheckoutStep.ORDER_SUMMARY}
                        title="Final Review"
                        icon={ShoppingBag}
                        activeStep={CheckoutStep.ORDER_SUMMARY}
                        isCompleted={isStepCompleted(CheckoutStep.ORDER_SUMMARY)}
                        onPress={() => {}}
                        disabled={!isStepAccessible(CheckoutStep.ORDER_SUMMARY)}
                      />
                      {isStepAccessible(CheckoutStep.ORDER_SUMMARY) ? (
                        <OrderSummarySection
                          buyerProfile={buyerProfile}
                          selectedAddressId={selectedAddressId}
                          availableDeliveryTypes={availableDeliveryTypes}
                          selectedDeliveryType={selectedDeliveryType}
                          paymentMethods={PAYMENT_METHODS}
                          selectedPaymentCategory={selectedPaymentCategory}
                          cartTotals={cartTotals}
                          totalItemCount={cart.getTotalItemCount()}
                          onPlaceOrder={handleContinueToPayment}
                          onPaymentCategorySelect={handlePaymentCategorySelect}
                          isPaymentsEnabled={isPaymentsEnabled}
                          isDeliveryEnabled={isDeliveryEnabled}
                        />
                      ) : (
                        <View className="p-4 border-t border-border">
                          <Text className="text-sm text-muted-foreground text-center">
                            {isDeliveryEnabled ? "Please select delivery options first" : "Please select a payment method"}
                          </Text>
                        </View>
                      )}
                    </Card>
                  </View>
                  {/* SimilarItems Section */}
                  <View ref={similarItemsRef} className="m-4">
                    <View className="px-4 max-w-7xl mx-auto">
                      <SimilarItems
                        productId={productId as string}
                        categoryId={cart.cart?.items[0]?.metadata?.category_id}
                        count={6}
                        title="You May Also Like"
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        {isDeliveryEnabled && (
        <AddressModal
          isOpen={showAddressModal}
          address={selectedAddress}
          onClose={() => {
            setShowAddressModal(false);
            setSelectedAddress(null);
          }}
          onSubmit={handleAddressModalSubmit}
        />
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
};

export default CheckoutScreen;
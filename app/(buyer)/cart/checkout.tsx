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
  Trash2,
} from "lucide-react-native";
import { useTunzaaAuth as useAuth } from "@/src/contexts/TunzaaAuthContext";
import { useCartCombined, useCartTotals } from "@/src/stores/cart";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import {
  useDeliveryTypesWithFallback,
  useGetDeliveryPartners,
  useCalculateShippingFee,
} from "@/src/services/delivery";
import { useGetVendor } from "@/src/services/vendors";
import { useGetVehicleTypes } from "@/src/services/configuration";
import { useGetBuyerProfile } from "@/src/services/buyers";
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
import { useLanguage } from "@/src/contexts/LanguageContext";
import type {
  DeliveryAddress,
  UpdateBuyerProfileBody,
} from "@/src/services/types/buyers";
import type { DeliveryPartner } from "@/src/services/types/delivery";
import type { VehicleType } from "@/src/services/types/configuration";
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
  const { returnTo, productId, addressId } = useLocalSearchParams<{ returnTo?: string; productId?: string; addressId?: string }>();
  const { user } = useAuth();
  const userId = user?.user_id || (user as any)?.id || "";
  const cart = useCartCombined(userId);
  const { isDesktop } = useResponsive();
  const { t } = useLanguage();

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
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addressId || "");
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
  const { refetch: refetchBuyerProfile } = useGetBuyerProfile(user?.user_id ?? "", !!user?.user_id);

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) {
        refetchBuyerProfile();
      }
    }, [user?.user_id, refetchBuyerProfile])
  );

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
        setSelectedAddressId(newAddress.address_id || (newAddress as any)._id || "");
      }
    },
    onError: (errorMsg) => setError(errorMsg),
  });

  // Auto-initialize selectedAddressId from profile
  useEffect(() => {
    if (buyerProfile?.delivery_address && buyerProfile.delivery_address.length > 0) {
      const defaultId = buyerProfile.default_delivery_address;
      const defaultExists = buyerProfile.delivery_address.some((addr) => (addr.address_id || (addr as any)._id) === defaultId);
      const currentExists = buyerProfile.delivery_address.some((addr) => (addr.address_id || (addr as any)._id) === selectedAddressId);
      
      if (!selectedAddressId || !currentExists) {
        if (defaultId && defaultExists) {
          setSelectedAddressId(defaultId);
        } else {
          setSelectedAddressId(buyerProfile.delivery_address[0].address_id || (buyerProfile.delivery_address[0] as any)._id || "");
        }
      }
    }
  }, [buyerProfile, selectedAddressId]);

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
  
  // Dynamic Shipping Fee Calculation
  const vendorId = cart.cart?.items[0]?.metadata?.vendor_id || cart.cart?.items[0]?.vendor_id;
  const { data: vendor } = useGetVendor(vendorId as string, !!vendorId);
  const { mutate: calculateFee, data: feeData, isPending: calculatingFee } = useCalculateShippingFee();

  useEffect(() => {
    if (isDeliveryEnabled && selectedAddressId && selectedDeliveryType && vendor?.latitude && vendor?.longitude) {
      const selectedAddressData = buyerProfile?.delivery_address?.find(
        (addr) => (addr.address_id || (addr as any)._id) === selectedAddressId
      );
      
      if (selectedAddressData?.lat && selectedAddressData?.lng) {
        calculateFee({
          origin: { lat: vendor.latitude, lng: vendor.longitude },
          destination: { 
            lat: parseFloat(selectedAddressData.lat), 
            lng: parseFloat(selectedAddressData.lng) 
          },
          // Mapping delivery type to vehicle type for the fee engine
          vehicle_type_id: "motorcycle", // Both standard and express utilize boda-boda (motorcycle)
          partner_id: selectedPartner || undefined
        });
      }
    }
  }, [selectedAddressId, selectedDeliveryType, selectedPartner, vendor, buyerProfile, isDeliveryEnabled, calculateFee]);

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

      const selectedAddressData = buyerProfile.delivery_address?.find(
        (addr) => (addr.address_id || (addr as any)._id) === selectedAddressId
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

    const deliveryFeeStr = feeData?.fee?.toString() || "0";
    const subtotalCalc = cartTotals?.total || cart.cart?.items.reduce((sum, item) => sum + ((item.sale_price || item.unit_price || 0) * item.quantity), 0) || 0;
    const taxCalc = subtotalCalc * 0.18;
    const discountCalc = cartTotals?.discount || 0;
    const computedTotal = subtotalCalc + Number(deliveryFeeStr) + taxCalc - discountCalc;

    const baseParams = {
      cartId: cart.cart?.cart_id || "",
      paymentMethod: isPaymentsEnabled ? selectedPaymentCategory : "cash_on_delivery",
      addressId: isDeliveryEnabled ? selectedAddressId : "",
      deliveryType: isDeliveryEnabled ? selectedDeliveryType : "",
      vehicleId: isDeliveryEnabled ? (selectedVehicle || "") : "",
      partnerId: isDeliveryEnabled ? (selectedPartner || "") : "",
      calculatedFee: deliveryFeeStr,
      returnTo: returnTo || "cart",
      productId: productId || "",
      amount: computedTotal.toString(),
      deliveryFees: deliveryFeeStr,
    };

    if (selectedPaymentCategory === "tunzaa_instalments") {
      router.push({
        pathname: "/(buyer)/payment/installment-goal",
        params: baseParams,
      });
    } else {
      router.push({
        pathname: "/(buyer)/payment/methods",
        params: baseParams,
      });
    }
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

  // Ref to hold the latest cart functions to avoid useFocusEffect dependency triggers
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Restore cart on unmount
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      return () => {
        isActive = false;
        const tempCart = cartRef.current.getTempCart();
        if (tempCart?.cart) {
          // console.log('Checkout screen lost focus, restoring cart...');
          cartRef.current.restoreOriginalCart().catch(console.error);
        }
      };
    }, [])
  );

  // Auto-select first delivery type if none selected
  useEffect(() => {
    if (availableDeliveryTypes.length > 0 && !selectedDeliveryType) {
      setSelectedDeliveryType(availableDeliveryTypes[0].id);
    }
  }, [availableDeliveryTypes, selectedDeliveryType]);

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
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">{t.checkoutPageTitle}</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground">{t.checkoutLoadingCart}</Text>
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
                {t.checkoutEmptyCartMsg}
              </Text>
            </Alert>
            <View className="flex-row space-x-2">
              <Button variant="outline" onPress={() => cart.refetch()}>
                <Text>{t.checkoutRefreshCart}</Text>
              </Button>
              <Button onPress={handleBackNavigation}>
                <Text>{t.checkoutGoBack}</Text>
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
                {t.checkoutInvalidCartMsg}
              </Text>
            </Alert>
            <Button onPress={() => router.push("/(buyer)/cart")}>
              <Text>{t.checkoutGoToCart}</Text>
            </Button>
          </View>
        </SafeAreaView>
      );
    }
  }

  const cartItems = cart.cart?.items || [];
  const selectedAddressData = buyerProfile?.delivery_address?.find(
    (addr) => (addr.address_id || (addr as any)._id) === selectedAddressId
  );

  const handlePayment = (method: string) => {
    if (isDeliveryEnabled && !selectedAddressId) {
      setError("Please select a delivery location first.");
      return;
    }
    
    const deliveryFeeStr = feeData?.fee?.toString() || "0";
    const subtotalCalc = cartTotals?.total || cart.cart?.items.reduce((sum, item) => sum + ((item.sale_price || item.unit_price || 0) * item.quantity), 0) || 0;
    const taxCalc = subtotalCalc * 0.18;
    const discountCalc = cartTotals?.discount || 0;
    const computedTotal = subtotalCalc + Number(deliveryFeeStr) + taxCalc - discountCalc;

    const baseParams = {
      cartId: cart.cart?.cart_id || "",
      paymentMethod: method,
      addressId: isDeliveryEnabled ? selectedAddressId : "",
      deliveryType: isDeliveryEnabled ? selectedDeliveryType : "",
      vehicleId: isDeliveryEnabled ? (selectedVehicle || "") : "",
      partnerId: isDeliveryEnabled ? (selectedPartner || "") : "",
      calculatedFee: deliveryFeeStr,
      returnTo: returnTo || "cart",
      productId: productId || "",
      amount: computedTotal.toString(),
      deliveryFees: deliveryFeeStr,
    };

    if (method === "tunzaa_instalments") {
      router.push({
        pathname: "/(buyer)/payment/installment-goal",
        params: baseParams,
      });
    } else {
      router.push({
        pathname: "/(buyer)/payment/methods",
        params: baseParams,
      });
    }
  };

  const deliveryFee = feeData?.fee || 0;
  const subtotal = cartTotals?.total || cartItems.reduce((sum, item) => sum + ((item.sale_price || item.unit_price || 0) * item.quantity), 0) || 0;
  const tax = subtotal * 0.18; // 18% tax
  const discount = 0;
  const totalCosts = subtotal + deliveryFee + tax - discount;

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={false}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className={`flex-1 w-full max-w-7xl mx-auto bg-white`}>
          {!isDesktop && (
            <View className="flex-row items-center justify-center p-4 bg-white border-b border-gray-100 w-full relative">
              <TouchableOpacity onPress={handleBackNavigation} className="absolute left-4">
                <ArrowLeft size={24} color="#000000" />
              </TouchableOpacity>
              <Text className="text-[20px] font-bold text-black text-center">{t.checkoutOrderSummaryTitle}</Text>
            </View>
          )}

          {error && (
            <View className="mx-4 mt-4">
              <Alert icon={Terminal} variant="destructive">
                <Text className="text-sm text-destructive">{error}</Text>
              </Alert>
            </View>
          )}

          <ScrollView className="flex-1 px-4 pt-4 pb-[300px]" showsVerticalScrollIndicator={false}>
            {/* My cart */}
            <Text className="text-[20px] font-bold mb-4 text-black">{t.checkoutMyCartTitle}</Text>
            
            {cartItems.map((item) => {
              const rawImage = item.image_url || item.metadata?.image_url || item.metadata?.image;
              const imageUrl = typeof rawImage === 'string' 
                ? rawImage 
                : (rawImage?.url || 'https://via.placeholder.com/300x300?text=No+Image');
              const itemName = item.product_name || item.name || item.metadata?.name || 'Product';

              return (
                <View key={item.item_id || item.product_id} className="mb-8 flex-row items-stretch">
                  <View className="w-[140px] h-[140px] bg-[#F4F6F9] rounded-3xl overflow-hidden mr-4 items-center justify-center">
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="w-full h-full bg-gray-200" />
                    )}
                  </View>
                  <View className="flex-1 justify-between py-2">
                    <View>
                      <Text className="text-[16px] text-[#3B5191] font-normal mb-1" numberOfLines={2}>{itemName}</Text>
                      <Text className="text-[18px] font-bold text-black mb-2">Tsh. {(item.sale_price || item.unit_price || 0).toLocaleString()}</Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-auto">
                      <View className="flex-row items-center bg-[#F4F6F9] rounded-full h-10 px-1 w-[100px] justify-between">
                        <TouchableOpacity 
                          className="w-8 h-8 items-center justify-center" 
                          onPress={() => cart.updateCartItemQuantity(item.product_id, item.metadata?.sku, Math.max(1, item.quantity - 1))}
                        >
                          <Text className="text-gray-500 text-xl leading-none font-medium">-</Text>
                        </TouchableOpacity>
                        <Text className="font-medium text-[15px] text-black">{item.quantity || 1}</Text>
                        <TouchableOpacity 
                          className="w-8 h-8 items-center justify-center bg-[#3B5191] rounded-full shadow-sm" 
                          onPress={() => cart.updateCartItemQuantity(item.product_id, item.metadata?.sku, item.quantity + 1)}
                        >
                          <Text className="text-white text-lg font-medium leading-none">+</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => cart.removeCartItem(item.product_id, item.metadata?.sku)} className="px-2">
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Order(1 item) */}
            <Text className="text-[20px] font-bold mb-4 text-black mt-2">{t.checkoutOrderPrefix}{cart.getTotalItemCount()}{cart.getTotalItemCount() !== 1 ? t.checkoutOrderSuffixPlural : t.checkoutOrderSuffixSingular}</Text>
            
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-[40px]">
              {cartItems.map((item, index) => {
                const itemName = item.product_name || item.name || item.metadata?.name || 'product';
                return (
                  <View key={`summary-${item.item_id || item.product_id}`}>
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-[#6B7280] text-[18px]">{t.checkoutProductLabel}</Text>
                      <Text className="text-black text-[18px]" numberOfLines={1}>
                        {itemName}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-[#6B7280] text-[18px]">{t.checkoutPriceLabel}</Text>
                      <Text className="text-black text-[18px]">Tsh. {((item.sale_price || item.unit_price || 0) * item.quantity).toLocaleString()}</Text>
                    </View>
                    {index < cartItems.length - 1 && <View className="h-[1px] bg-gray-100 my-4" />}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Fixed Bottom Section */}
          <View className="absolute bottom-0 left-0 right-0 bg-white" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 20,
          }}>
            <View className="p-6">
              <View className="flex-row justify-between mb-5">
                <Text className="text-[#6B7280] text-[18px]">{t.checkoutSubtotalLabel}</Text>
                <Text className="text-black font-bold text-[18px]">Tsh. {subtotal.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-5">
                <Text className="text-[#6B7280] text-[18px]">{t.checkoutDiscountLabel}</Text>
                <Text className="text-[#6B7280] text-[18px]">Tsh. {discount.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-5">
                <Text className="text-[#6B7280] text-[18px]">{t.checkoutDeliveryFeesLabel}</Text>
                <Text className="text-black font-bold text-[18px]">Tsh. {deliveryFee.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-7">
                <Text className="text-[#6B7280] text-[18px]">{t.checkoutTaxLabel}</Text>
                <Text className="text-black font-bold text-[18px]">Tsh. {tax.toLocaleString()}</Text>
              </View>
              
              <View className="h-[1px] bg-gray-100 mb-6" />
              
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-black font-bold text-[18px]">{t.checkoutTotalCostsLabel}</Text>
                <Text className="text-black font-bold text-[24px]">Tsh. {totalCosts.toLocaleString()}</Text>
              </View>

              {/* Bottom Actions */}
              <View className="flex-row justify-between items-center">
                <TouchableOpacity 
                  className="flex-1 bg-[#00B200] rounded-full items-center justify-center py-2 h-14 flex-col mr-2"
                  onPress={() => handlePayment('tunzaa_instalments')}
                >
                  <Text className="text-white font-bold text-[16px] leading-tight mb-0.5">{t.checkoutInstallmentBtn}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-[#3B5191] rounded-full items-center justify-center py-2 h-14 ml-2"
                  onPress={() => handlePayment('mobile_money')}
                >
                  <Text className="text-white font-bold text-[16px]">{t.checkoutPayNowBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
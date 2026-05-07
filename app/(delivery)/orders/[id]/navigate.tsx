import React, { useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { DeliveryNavigation } from "@/components/delivery/DeliveryNavigation";
import { useDelivery } from "@/src/services/delivery";
import { useGetOrder } from "@/src/services/order-management";
import { useGetVendor } from "@/src/services/vendors";
import type { DeliveryLocation } from "@/components/delivery/DeliveryMap";
import { useI18n } from "@/hooks/useI18n";

export default function NavigateScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams();
  const deliveryId = Array.isArray(id) ? id[0] : id;

  // Fetch delivery details
  const {
    data: delivery,
    isLoading: deliveryLoading,
    error: deliveryError,
  } = useDelivery(deliveryId);

  // Fetch order details using the order_id from delivery
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useGetOrder(delivery?.order_id || "", !!delivery?.order_id);

  // Get the first vendor ID from order items (for multi-vendor, we'd need to handle multiple pickups)
  const firstVendorId = order?.items[0]?.vendor_id;

  // Fetch vendor details to get location if not in order metadata
  // const {
  //   data: vendor,
  //   isLoading: vendorLoading,
  // } = useGetVendor(firstVendorId || "", !!firstVendorId && !!order && !order.metadata?.pickup_location);

  if (deliveryLoading || orderLoading) {//} || vendorLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">{t("delivery_navigation.loading_navigation")}</Text>
      </SafeAreaView>
    );
  }

  if (deliveryError || orderError || !delivery || !order) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-destructive text-center">
          {t("delivery_navigation.failed_to_load")}
        </Text>
      </SafeAreaView>
    );
  }

  // Extract pickup location from order metadata or use fallback
  const pickupCoords = useMemo(() => {
    console.log("order", JSON.stringify(order, null, 2));

    // console.log("vendor", JSON.stringify(vendor, null, 2));
    // 1. Try order metadata first (should be saved during order creation)
    // if (order.metadata?.pickup_location || order.metadata?.vendor_location) {
    //   return order.metadata.pickup_location || order.metadata.vendor_location;
    // }
    
    // // 2. Try vendor's metadata if available
    // const vendorMeta = vendor as any;
    // if (vendorMeta?.latitude && vendorMeta?.longitude) {
    //   return { lat: vendorMeta.latitude, lng: vendorMeta.longitude };
    // }
    
    // 3. Fallback to default Dar es Salaam coordinates
    // TODO: Implement geocoding for vendor addresses to get coordinates
    console.warn('Using fallback coordinates for pickup location. Consider adding coordinates to vendor profiles.');
    return { lat: -6.7924, lng: 39.2083 };
  }, [order]);

  const pickupLocation: DeliveryLocation = {
    latitude: pickupCoords.lat,// || pickupCoords.latitude,
    longitude: pickupCoords.lng,// || pickupCoords.longitude,
    title: t("delivery_navigation.pickup_location"),
    // description: vendor?.business_name || order.items[0]?.store?.store_name || t("delivery_navigation.store_location"),
    description: t("delivery_navigation.store_location"),
  };

  // Extract drop-off location from order metadata or shipping address
  const deliveryCoords = useMemo(() => {
    // 1. Try order metadata first (saved during checkout)
    if (order.metadata?.delivery_location || order.metadata?.shipping_location) {
      return order.metadata.delivery_location || order.metadata.shipping_location;
    }
    
    // 2. Try shipping address if it has coordinates
    const shippingAddr = order.shipping_address as any;
    if (shippingAddr?.lat && shippingAddr?.lng) {
      return { lat: parseFloat(shippingAddr.lat), lng: parseFloat(shippingAddr.lng) };
    }
    
    // 3. Fallback coordinates
    return { lat: -6.7624, lng: 39.2283 };
  }, [order.metadata, order.shipping_address]);

  const dropoffLocation: DeliveryLocation = {
    latitude: deliveryCoords.lat || deliveryCoords.latitude,
    longitude: deliveryCoords.lng || deliveryCoords.longitude,
    title: t("delivery_navigation.delivery_address"),
    description: `${order.shipping_address.first_name} ${order.shipping_address.last_name} - ${order.shipping_address.address_line1}, ${order.shipping_address.city}`,
  };

  return (
    <DeliveryNavigation
      pickupLocation={pickupLocation}
      dropoffLocation={dropoffLocation}
      orderId={order.order_id}
      deliveryId={delivery.delivery_id}
      onNavigationStart={() => {
        console.log("Navigation started for delivery:", delivery.delivery_id);
      }}
      onNavigationComplete={() => {
        console.log("Navigation completed for delivery:", delivery.delivery_id);
      }}
    />
  );
}

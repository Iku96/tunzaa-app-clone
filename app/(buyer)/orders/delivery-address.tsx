import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MapPin, Plus, Home, Briefcase, MoreHorizontal } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { buyersApi, useUpdateBuyerProfile } from "@/src/services/buyers";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/src/contexts/LanguageContext";

type AddressType = "home" | "work" | "other";

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { cartId, orderId, partnerId, lat, lng, address } = useLocalSearchParams();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateBuyerProfile();

  const [selectedType, setSelectedType] = useState<AddressType>("home");
  const [addressLine, setAddressLine] = useState((address as string) || "");
  const [metro, setMetro] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  useEffect(() => {
    if (address && typeof address === "string") {
      setAddressLine(address);
      // Attempt to extract city from reverse geocoded address (e.g., "Street Name, City")
      const parts = address.split(",");
      if (parts.length > 1) {
        setMetro(parts[parts.length - 1].trim());
      }
    }
  }, [address]);

  const isNewAddressMode = !!(lat && lng);

  // Fetch buyer profile for saved addresses
  const { data: buyerProfile, isLoading } = useQuery({
    queryKey: ["buyerProfile", user?.user_id],
    queryFn: () => buyersApi.getBuyerProfile(user?.user_id as string),
    enabled: !!user?.user_id,
  });

  const savedAddresses = buyerProfile?.delivery_address || [];

  const handleAddNewAddress = () => {
    router.push({
      pathname: "/(buyer)/orders/pin-location",
      params: { cartId, orderId, partnerId },
    });
  };

  const handleSaveAndContinue = () => {
    if (isNewAddressMode) {
      if (!user?.user_id) return;
      
      const newAddressId = `addr_${Date.now()}`;
      const newAddress = {
        address_id: newAddressId,
        title: selectedType === "other" ? "Other" : (selectedType === "home" ? "Home" : "Work"),
        address_line1: addressLine,
        city: metro || "Dar es Salaam",
        state_province: metro || "Dar es Salaam",
        country: "Tanzania",
        land_mark: landmark,
        lat: lat as string,
        lng: lng as string
      };

      updateProfileMutation.mutate({
        userId: user.user_id,
        data: {
          user_id: user.user_id,
          tenant_id: buyerProfile?.tenant_id || "",
          contact_email: buyerProfile?.contact_email || user?.email || "",
          contact_phone: buyerProfile?.contact_phone || user?.phone_number || "",
          delivery_address: [...savedAddresses, newAddress],
        }
      }, {
        onSuccess: () => {
          router.setParams({ lat: "", lng: "", address: "" });
          setSelectedAddressId(newAddressId);
        }
      });
    } else if (selectedAddressId) {
      // Use selected saved address
      router.push({
        pathname: "/(buyer)/payment",
        params: {
          cartId,
          orderId,
          partnerId: partnerId as string,
          addressId: selectedAddressId,
          deliveryType: "courier",
        },
      });
    }
  };

  const typeOptions: { key: AddressType; label: string; icon: any }[] = [
    { key: "home", label: t.deliveryAddressTypeHome, icon: Home },
    { key: "work", label: t.deliveryAddressTypeWork, icon: Briefcase },
    { key: "other", label: t.deliveryAddressTypeOther, icon: MoreHorizontal },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground ml-3">{t.deliveryAddressTitle}</Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-6">
          {/* Title */}
          <Text className="text-xl font-bold text-foreground mb-2">
            {isNewAddressMode ? t.deliveryAddressConfirmTitle : t.deliveryAddressWhereTo}
          </Text>
          <Text className="text-sm text-muted-foreground mb-6">
            {isNewAddressMode ? t.deliveryAddressVerifyDesc : t.deliveryAddressSelectDesc}
          </Text>

          {/* Dynamic Content based on Mode */}
          {isNewAddressMode ? (
            <View>
              {/* Address Type Tabs */}
              <Text className="text-sm font-semibold text-muted-foreground mt-4 mb-3">
                {t.deliveryAddressTypeLabel}
              </Text>
              <View className="flex-row gap-3 mb-6">
                {typeOptions.map(({ key, label, icon: Icon }) => (
                  <TouchableOpacity
                    key={key}
                    className="flex-row items-center px-4 py-2 rounded-full border"
                    style={{
                      borderColor: selectedType === key ? "#425BA4" : "#E5E7EB",
                      backgroundColor: selectedType === key ? "#425BA4" : "#FFFFFF",
                    }}
                    onPress={() => setSelectedType(key)}
                  >
                    <Icon
                      size={14}
                      color={selectedType === key ? "#FFFFFF" : "#6B7280"}
                    />
                    <Text
                      className="text-sm font-medium ml-1.5"
                      style={{
                        color: selectedType === key ? "#FFFFFF" : "#6B7280",
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-semibold text-muted-foreground mb-2">
                {t.deliveryAddressStreetLabel}
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
                placeholder={t.deliveryAddressStreetPlaceholder}
                placeholderTextColor="#9CA3AF"
                value={addressLine}
                onChangeText={setAddressLine}
              />

              <Text className="text-sm font-semibold text-muted-foreground mb-2">
                {t.deliveryAddressCityLabel}
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
                placeholder={t.deliveryAddressCityPlaceholder}
                placeholderTextColor="#9CA3AF"
                value={metro}
                onChangeText={setMetro}
              />

              <Text className="text-sm font-semibold text-muted-foreground mb-2">
                {t.deliveryAddressLandmarkLabel}
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3 text-base text-foreground mb-6"
                placeholder={t.deliveryAddressLandmarkPlaceholder}
                placeholderTextColor="#9CA3AF"
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>
          ) : (
            <View>
              {/* Add New Address Button */}
              <TouchableOpacity
                className="flex-row items-center py-4 px-4 rounded-xl border border-dashed border-border mb-6"
                onPress={handleAddNewAddress}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#EFF6FF" }}
                >
                  <Plus size={20} color="#425BA4" />
                </View>
                <Text className="text-base font-medium text-foreground ml-3">{t.deliveryAddressAddNew}</Text>
              </TouchableOpacity>

              {/* Saved Addresses */}
              {isLoading ? (
                <ActivityIndicator size="large" color="#425BA4" />
              ) : savedAddresses.length > 0 ? (
                <>
                  <Text className="text-sm font-semibold text-muted-foreground mb-3">
                    {t.deliveryAddressSavedLabel}
                  </Text>
                  {savedAddresses.map((addr: any) => {
                    const isSelected = selectedAddressId === addr.address_id;
                    return (
                      <TouchableOpacity
                        key={addr.address_id}
                        className="flex-row items-center py-4 px-4 rounded-xl border mb-3"
                        style={{
                          borderColor: isSelected ? "#425BA4" : "#E5E7EB",
                          backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                        }}
                        onPress={() => setSelectedAddressId(addr.address_id)}
                      >
                        <MapPin
                          size={20}
                          color={isSelected ? "#425BA4" : "#9CA3AF"}
                        />
                        <View className="flex-1 ml-3">
                          <Text className="text-sm font-semibold text-foreground">
                            {addr.address_line1}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {addr.city}
                            {addr.state_province ? `, ${addr.state_province}` : ""}
                          </Text>
                        </View>
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center"
                          style={{
                            borderColor: isSelected ? "#425BA4" : "#D1D5DB",
                          }}
                        >
                          {isSelected && (
                            <View
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: "#425BA4" }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : null}
            </View>
          )}



          {/* Delivery Note */}
          <Text className="text-sm font-semibold text-muted-foreground mb-2">
            {t.deliveryAddressNoteLabel}
          </Text>
          <TextInput
            className="border border-border rounded-xl px-4 py-3 text-base text-foreground mb-6"
            placeholder={t.deliveryAddressNotePlaceholder}
            placeholderTextColor="#9CA3AF"
            value={deliveryNote}
            onChangeText={setDeliveryNote}
            multiline
            numberOfLines={2}
            style={{ minHeight: 60, textAlignVertical: "top" }}
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-4 pb-8 pt-4 border-t border-border bg-background">
        <TouchableOpacity
          className="py-4 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: (isNewAddressMode ? !addressLine : !selectedAddressId) ? "#9CA3AF" : "#425BA4",
          }}
          onPress={handleSaveAndContinue}
          disabled={isNewAddressMode ? !addressLine || updateProfileMutation.isPending : !selectedAddressId}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
              {isNewAddressMode ? t.deliveryAddressSaveBtn : t.deliveryAddressContinueBtn}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

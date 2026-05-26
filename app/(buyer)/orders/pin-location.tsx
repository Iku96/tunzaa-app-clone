import { useLanguage } from "@/src/contexts/LanguageContext";
import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, TextInput, Dimensions, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, MapPin, Navigation } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function PinLocationScreen() {
    const { t } = useLanguage();
  const router = useRouter();
  const { cartId, orderId, partnerId } = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: -6.7924, // Dar es Salaam default
    longitude: 39.2083,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [isLocating, setIsLocating] = useState(true);

  const locateUser = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLocating(false);
        return;
      }
      
      // Try last known first for instant response
      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCurrentRegion(region);
      
      // Reverse geocode
      let addr = "";
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (results.length > 0) {
          const item = results[0];
          addr = `${item.name || ""} ${item.street || ""}, ${item.city || item.region || ""}`.trim();
          addr = addr.replace(/^,\s*/, ''); // Remove leading comma if any
        }
      } catch (err) {
        console.warn("Reverse geocode error:", err);
      }

      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: addr || t.pinLocationCurrent,
      });
      mapRef.current?.animateToRegion(region, 500);
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setIsLocating(false);
    }
  };

  // Get user's current location on mount
  useEffect(() => {
    locateUser();
  }, []);

  const handleRegionChangeComplete = async (region: any) => {
    setCurrentRegion(region);
    const { latitude, longitude } = region;
    
    // We update coordinates immediately so UI feels responsive
    setSelectedLocation((prev) => ({
      latitude,
      longitude,
      address: prev?.address, // Keep old address while loading
    }));

    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const item = results[0];
        let addr = `${item.name || ""} ${item.street || ""}, ${item.city || item.region || ""}`.trim();
        addr = addr.replace(/^,\s*/, '');
        setSelectedLocation({
          latitude,
          longitude,
          address: addr || t.pinLocationSelected,
        });
      }
    } catch (err) {
      console.warn("Reverse geocode error:", err);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) return;

    // Navigate back to delivery address with the selected coordinates
    router.push({
      pathname: "/(buyer)/orders/delivery-address",
      params: {
        cartId,
        orderId,
        partnerId,
        lat: selectedLocation.latitude.toString(),
        lng: selectedLocation.longitude.toString(),
        address: selectedLocation.address || "",
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Map Container */}
      <View style={{ width, height: height * 0.75 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={currentRegion}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
        />

        {/* Fixed Center Pin Overlay */}
        <View 
          className="absolute top-1/2 left-1/2 items-center justify-center" 
          style={{ marginTop: -36, marginLeft: -18 }} 
          pointerEvents="none"
        >
          <MapPin size={36} color="#425BA4" fill="#425BA4" />
        </View>
      </View>

      {/* Locate Me Floating Button */}
      <View className="absolute right-4" style={{ bottom: 180 }}>
        <TouchableOpacity
          className="w-12 h-12 bg-white rounded-full items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={locateUser}
          disabled={isLocating}
        >
          <Navigation size={22} color={isLocating ? "#9CA3AF" : "#425BA4"} />
        </TouchableOpacity>
      </View>

      {/* Search Bar Overlay */}
      <SafeAreaView
        className="absolute top-0 left-0 right-0"
        edges={["top"]}
      >
        <View className="flex-row items-center mx-4 mt-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>

          <View
            className="flex-1 flex-row items-center bg-white rounded-xl px-4 py-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Search size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-sm text-foreground"
              placeholder={t.pinLocationSearchPlaceholder}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4 pb-8"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {selectedLocation ? (
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#425BA4" />
              <Text className="text-sm font-semibold text-foreground ml-2">
                {selectedLocation.address ? selectedLocation.address : t.pinLocationSelected}
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              {t.pinLocationCoordinates}{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            <Text className="text-sm text-muted-foreground">
              {isLocating ? t.pinLocationGetting : t.pinLocationTapPrompt}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="py-4 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: "#425BA4",
            opacity: !selectedLocation ? 0.5 : 1,
          }}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>{t.pinLocationConfirmBtn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

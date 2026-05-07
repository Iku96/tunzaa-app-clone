import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, TextInput, Dimensions, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, MapPin } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function PinLocationScreen() {
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

  // Get user's current location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLocating(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setCurrentRegion(region);
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        mapRef.current?.animateToRegion(region, 500);
      } catch (error) {
        console.error("Location error:", error);
      } finally {
        setIsLocating(false);
      }
    })();
  }, []);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
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
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ width, height: height * 0.75 }}
        initialRegion={currentRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {selectedLocation && (
          // @ts-expect-error - react-native-maps Marker type mismatch
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Delivery location"
          />
        )}
      </MapView>

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
              placeholder="Search for a location..."
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
                Selected Location
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            <Text className="text-sm text-muted-foreground">
              {isLocating ? "Getting your location..." : "Tap on the map to select a delivery point"}
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
          <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
            Confirm Address
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Navigation as NavigationIcon,
  ExternalLink,
  MapPin,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import {
  DeliveryMap,
  SimpleMapTest,
  type DeliveryLocation,
  type LocationCoordinate,
} from "./DeliveryMap";
import {
  navigationService,
  type NavigationOptions,
  type RouteInfo,
} from "@/services/navigation";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface DeliveryNavigationProps {
  pickupLocation: DeliveryLocation;
  dropoffLocation: DeliveryLocation;
  orderId?: string;
  deliveryId?: string;
  onNavigationStart?: () => void;
  onNavigationComplete?: () => void;
}

export function DeliveryNavigation({
  pickupLocation,
  dropoffLocation,
  orderId,
  deliveryId,
  onNavigationStart,
  onNavigationComplete,
}: DeliveryNavigationProps) {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinate | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  // Debug logging
  useEffect(() => {
    
  }, [pickupLocation, dropoffLocation, currentLocation, mapReady, route]);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Build route when current location is available
  useEffect(() => {
    if (currentLocation && mapReady) {
      buildRoute();
    }
  }, [currentLocation, mapReady]);

  const getCurrentLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    try {
      const location = await navigationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const buildRoute = useCallback(async () => {
    if (!currentLocation) return;

    setIsLoadingRoute(true);
    try {
      const navigationOptions: NavigationOptions = {
        origin: currentLocation,
        waypoints: [pickupLocation], // Pickup is a waypoint
        destination: dropoffLocation,
        mode: "driving",
      };

      const routeInfo = await navigationService.getRoute(navigationOptions);
      if (routeInfo) {
        setRoute(routeInfo);
      }
    } catch (error) {
      console.error("Error building route:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [currentLocation, pickupLocation, dropoffLocation]);

  const handleNavigate = useCallback(async () => {
    if (!currentLocation) {
      Alert.alert(
        "Location Required",
        "Please wait for your location to be detected."
      );
      return;
    }

    const navigationOptions: NavigationOptions = {
      origin: currentLocation,
      waypoints: [pickupLocation],
      destination: dropoffLocation,
      mode: "driving",
    };

    // Show navigation options
    Alert.alert(
      "Start Navigation",
      "This will open your navigation app with the delivery route.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Navigate",
          onPress: async () => {
            onNavigationStart?.();
            const success = await navigationService.launchExternalNavigation(
              navigationOptions
            );
            if (success) {
              // Optionally close this screen or show success message
            }
          },
        },
      ]
    );
  }, [currentLocation, pickupLocation, dropoffLocation, onNavigationStart]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const getEstimatedTime = () => {
    if (!route) return "Calculating...";
    return navigationService.formatDuration(route.duration);
  };

  const getTotalDistance = () => {
    if (!route) return "Calculating...";
    return navigationService.formatDistance(route.distance);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Navigation
        </Text>
        <Button
          variant="ghost"
          size="icon"
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          <MapPin
            size={24}
            className={
              isLoadingLocation ? "text-muted-foreground" : "text-foreground"
            }
          />
        </Button>
      </View>

      {/* Map */}
      <View className="flex-1">
        {/* <SimpleMapTest /> */}
        <DeliveryMap
          currentLocation={currentLocation || undefined}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          routePolyline={route?.polyline}
          onMapReady={handleMapReady}
        />
      </View>

      {/* Route Information */}
      <View className="p-4 bg-background border-t border-border">
        <Card className="p-4 mb-4">
          <View className="gap-4">
            {/* Route Stats */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground">Distance</Text>
                <Text className="text-lg font-semibold">
                  {getTotalDistance()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground">Time</Text>
                <Text className="text-lg font-semibold">
                  {getEstimatedTime()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground">Stops</Text>
                <Text className="text-lg font-semibold">2</Text>
              </View>
            </View>

            {/* Route Details */}
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 bg-blue-500 rounded-full" />
                <Text className="text-sm text-muted-foreground flex-1">
                  Your Location
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 bg-orange-500 rounded-full" />
                <View className="flex-1">
                  <Text className="text-sm font-medium">
                    {pickupLocation.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {pickupLocation.description}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 bg-red-500 rounded-full" />
                <View className="flex-1">
                  <Text className="text-sm font-medium">
                    {dropoffLocation.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {dropoffLocation.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Navigation Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full flex-row items-center justify-center gap-3"
          onPress={handleNavigate}
          disabled={!currentLocation || isLoadingLocation || isLoadingRoute}
        >
          <NavigationIcon size={20} className="text-white" />
          <Text className="text-white font-semibold text-lg">
            {isLoadingLocation
              ? "Getting Location..."
              : isLoadingRoute
              ? "Building Route..."
              : "Start Navigation"}
          </Text>
        </Button>

        {/* Fallback Info */}
        <Text className="text-xs text-center text-muted-foreground mt-2">
          Navigation will open in your default maps app
        </Text>
      </View>
    </SafeAreaView>
  );
}

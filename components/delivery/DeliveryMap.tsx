import React, { useRef, useEffect, useState } from "react";
import { View, Platform, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Text } from "@/components/ui/text";
import {
  getMapComponents,
  getMapProps,
  isMapsSupported,
  handleMapPress,
  getPolylineComponent as getMapProviderPolyline,
} from "@/utils/mapProvider";

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

export interface DeliveryLocation extends LocationCoordinate {
  title: string;
  description?: string;
}

interface DeliveryMapProps {
  currentLocation?: LocationCoordinate;
  pickupLocation: DeliveryLocation;
  dropoffLocation: DeliveryLocation;
  routePolyline?: LocationCoordinate[];
  onMapReady?: () => void;
  className?: string;
}

export function DeliveryMap({
  currentLocation,
  pickupLocation,
  dropoffLocation,
  routePolyline,
  onMapReady,
  className,
}: DeliveryMapProps) {
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Get map components
  const { MapView, Marker, isAvailable } = getMapComponents();

  // Debug logging
  useEffect(() => {

  }, [
    isAvailable,
    currentLocation,
    pickupLocation,
    dropoffLocation,
    routePolyline,
  ]);

  // Calculate region to fit all markers
  const calculateRegion = () => {
    const locations: LocationCoordinate[] = [pickupLocation, dropoffLocation];
    if (currentLocation) {
      locations.push(currentLocation);
    }

    const latitudes = locations.map((loc) => loc.latitude);
    const longitudes = locations.map((loc) => loc.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.5; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5; // Add padding

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
      longitudeDelta: Math.max(lngDelta, 0.01), // Minimum zoom level
    };
  };

  const region = calculateRegion();

  const mapProps = getMapProps({
    region,
    showsUserLocation: true,
    showsMyLocationButton: true,
    showsCompass: true,
    showsScale: true,
    followsUserLocation: false,
    onMapReady: () => {
      setIsLoading(false);
      setMapReady(true);
      onMapReady?.();
    },
  });

  useEffect(() => {
    // Auto-fit the map to show all markers when route is loaded
    if (mapRef.current && routePolyline && routePolyline.length > 0) {
      try {
        if (Platform.OS === "ios" || Platform.OS === "android") {
          // For native platforms
          if (mapRef.current.fitToCoordinates) {
            mapRef.current.fitToCoordinates(
              [currentLocation, pickupLocation, dropoffLocation].filter(
                Boolean
              ),
              {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              }
            );
          }
        }
      } catch (error) {
        console.warn("Error fitting map to coordinates:", error);
      }
    }
  }, [routePolyline, currentLocation, pickupLocation, dropoffLocation]);

  if (!isAvailable || !MapView) {
    return (
      <View
        className={`flex-1 justify-center items-center bg-muted ${className}`}
      >
        <Text className="text-muted-foreground text-center mb-4">
          Map is not available on this platform
        </Text>
        <Text className="text-xs text-muted-foreground text-center">
          Map Provider: {getMapComponents().provider}
          {"\n"}Available: {isAvailable ? "Yes" : "No"}
          {"\n"}MapView: {MapView ? "Yes" : "No"}
        </Text>
        <View className="mt-4 p-4 bg-background rounded-lg">
          <Text className="text-sm font-medium mb-2">Debug Info:</Text>
          <Text className="text-xs text-muted-foreground">
            Pickup: {pickupLocation.latitude}, {pickupLocation.longitude}
            {"\n"}Dropoff: {dropoffLocation.latitude},{" "}
            {dropoffLocation.longitude}
            {currentLocation &&
              `\nCurrent: ${currentLocation.latitude}, ${currentLocation.longitude}`}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-1 relative ${className}`}>
      {/* Test MapView visibility */}
      {/* <View className="absolute top-4 left-4 z-10 bg-red-500 p-2 rounded">
        <Text className="text-white text-xs">
          Map Status: {isAvailable ? "Available" : "Not Available"}
        </Text>
      </View> */}

      <MapView
        ref={mapRef}
        {...mapProps}
        className="flex-1"
        style={{ flex: 1, minHeight: 200 }}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="You are here"
            pinColor="#3b82f6" // Blue for current location
          />
        )}

        {/* Pickup Location Marker */}
        <Marker
          coordinate={pickupLocation}
          title={pickupLocation.title}
          description={pickupLocation.description || "Pickup Point"}
          pinColor="#f59e0b" // Orange for pickup
        />

        {/* Drop-off Location Marker */}
        <Marker
          coordinate={dropoffLocation}
          title={dropoffLocation.title}
          description={dropoffLocation.description || "Drop-off Point"}
          pinColor="#ef4444" // Red for drop-off
        />

        {/* Route Polyline */}
        {routePolyline &&
          routePolyline.length > 0 &&
          (() => {
            try {
              const PolylineComponent = getPolylineComponent();
              if (PolylineComponent && PolylineComponent !== View) {
                return (
                  <PolylineComponent
                    coordinates={routePolyline}
                    strokeColor="#3b82f6"
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                  />
                );
              }
            } catch (error) {
              console.warn("Error rendering polyline:", error);
            }
            return null;
          })()}
      </MapView>

      {/* Loading indicator */}
      {isLoading && (
        <View className="absolute inset-0 justify-center items-center bg-background/50">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-muted-foreground">Loading map...</Text>
        </View>
      )}

      {/* Debug overlay */}
      {/* <View className="absolute bottom-4 right-4 bg-black/70 p-2 rounded">
        <Text className="text-white text-xs">
          Provider: {getMapComponents().provider}
          {"\n"}Ready: {mapReady ? "Yes" : "No"}
        </Text>
      </View> */}
    </View>
  );
}

// Get Polyline component from map provider
function getPolylineComponent() {
  try {
    const mapComponents = getMapComponents();
    
    if (!mapComponents.MapView || !mapComponents.isAvailable) {
      return View;
    }

    // Use platform-specific polyline from mapProvider
    const PolylineComponent = getMapProviderPolyline();
    return PolylineComponent || View;
  } catch (error) {
    console.warn("Error getting polyline component:", error);
    return View;
  }
}

// Simple test component to verify MapView works
export function SimpleMapTest() {
  const { MapView, Marker, isAvailable } = getMapComponents();

  if (!isAvailable || !MapView) {
    return (
      <View className="flex-1 justify-center items-center bg-red-100">
        <Text className="text-red-600">Map not available</Text>
        <Text className="text-xs">Provider: {getMapComponents().provider}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-green-100">
      <Text className="p-2 bg-green-500 text-white">Map should be below</Text>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -6.7924,
          longitude: 39.2083,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {Marker && (
          <Marker
            coordinate={{ latitude: -6.7924, longitude: 39.2083 }}
            title="Test Marker"
          />
        )}
      </MapView>
    </View>
  );
}

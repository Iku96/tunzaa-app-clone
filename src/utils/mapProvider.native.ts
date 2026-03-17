import { Platform } from "react-native";
import { API_CONFIG } from "@/services/config";

interface MapComponents {
  MapView: any;
  Marker: any;
  isAvailable: boolean;
  provider:
    | "expo-maps"
    | "react-native-maps"
    | "react-native-web-maps"
    | "none";
  PROVIDER_GOOGLE?: any;
}

let mapComponents: MapComponents | null = null;

/**
 * Native-specific map provider
 * Uses expo-maps with react-native-maps fallback
 */
export function getMapComponents(): MapComponents {
  if (mapComponents) {
    return mapComponents;
  }

  let MapView: any = null;
  let Marker: any = null;
  let PROVIDER_GOOGLE: any = null;
  let provider: "expo-maps" | "react-native-maps" | "none" = "none";
  let isAvailable = false;

  // For native platforms, react-native-maps

  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default || Maps.MapView;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    provider = "react-native-maps";
    isAvailable = true;

  } catch (rnError) {
    console.error("❌ No map library available:", rnError);
    isAvailable = false;
  }

  mapComponents = {
    MapView: MapView || null,
    Marker: Marker || null,
    isAvailable,
    provider,
    PROVIDER_GOOGLE,
  };

  return mapComponents;
}

/**
 * Get native-specific map props with Google Maps configuration
 */
export function getMapProps(baseProps: any) {
  const { provider, PROVIDER_GOOGLE } = getMapComponents();

  // expo-maps and react-native-maps on native platforms
  const nativeProps = {
    ...baseProps,
    showsMyLocationButton: provider === "expo-maps" ? false : true,
  };

  // Add Google Maps provider for react-native-maps
  if (provider === "react-native-maps" && PROVIDER_GOOGLE) {
    nativeProps.provider = PROVIDER_GOOGLE;
  }

  return nativeProps;
}

/**
 * Handle native-specific map press events
 */
export function handleMapPress(event: any) {
  return event.nativeEvent.coordinate;
}

/**
 * Check if maps are supported on native platform
 */
export function isMapsSupported(): boolean {
  return getMapComponents().isAvailable;
}

/**
 * Get current map provider name
 */
export function getMapProvider(): string {
  return getMapComponents().provider;
}

/**
 * Get the Google Maps API key being used
 */
export function getGoogleMapsApiKey(): string {
  return API_CONFIG.GOOGLE_MAPS_API_KEY;
}

/**
 * Verify Google Maps API key is available
 */
export function isGoogleMapsApiKeyConfigured(): boolean {
  return Boolean(API_CONFIG.GOOGLE_MAPS_API_KEY);
}

/**
 * Get Polyline component for native platform
 */
export function getPolylineComponent(): any {
  try {
    const Maps = require("react-native-maps");
    return Maps.Polyline || null;
  } catch (error) {
    console.warn("Native Polyline not available:", error);
    return null;
  }
}

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
 * Initialize Google Maps with API key for web
 */
function initializeGoogleMapsWeb() {
  if (typeof window !== "undefined" && API_CONFIG.GOOGLE_MAPS_API_KEY) {
    (window as any).GOOGLE_MAPS_API_KEY = API_CONFIG.GOOGLE_MAPS_API_KEY;
    // Also set it in a common location that web map libraries look for
    if (!(window as any).google) {
      (window as any).google = {};
    }
    if (!(window as any).google.maps) {
      (window as any).google.maps = {};
    }
    (window as any).google.maps.apiKey = API_CONFIG.GOOGLE_MAPS_API_KEY;
  }
}

/**
 * Web-specific map provider
 * Only uses @teovilla/react-native-web-maps to avoid native module conflicts
 */
export function getMapComponents(): MapComponents {
  if (mapComponents) {
    return mapComponents;
  }

  // Initialize Google Maps API key for web
  initializeGoogleMapsWeb();

  let MapView: any = null;
  let Marker: any = null;
  let provider: "react-native-web-maps" | "none" = "none";
  let isAvailable = false;

  // Use @teovilla/react-native-web-maps for web platform
  try {
    const WebMaps = require("@teovilla/react-native-web-maps");
    MapView = WebMaps.default || WebMaps.MapView;
    Marker = WebMaps.Marker;
    provider = "react-native-web-maps";
    isAvailable = true;


  } catch (error) {
    console.warn(
      "⚠️ @teovilla/react-native-web-maps not available for web:",
      error
    );
    isAvailable = false;
  }

  mapComponents = {
    MapView: MapView || null,
    Marker: Marker || null,
    isAvailable,
    provider,
    PROVIDER_GOOGLE: undefined,
  };

  return mapComponents;
}

/**
 * Get web-specific map props with Google Maps configuration
 */
export function getMapProps(baseProps: any) {
  // Web-specific props for react-native-web-maps
  return {
    ...baseProps,
    initialRegion: baseProps.region || baseProps.initialRegion,
    // Remove region prop for web to avoid conflicts
    region: undefined,
    // Configure Google Maps for web with API key
    provider: "google",
    googleMapsApiKey: API_CONFIG.GOOGLE_MAPS_API_KEY,
  };
}

/**
 * Handle web-specific map press events
 */
export function handleMapPress(event: any) {
  const coordinate =
    event.nativeEvent?.latLng ||
    event.coordinate ||
    event.nativeEvent.coordinate;

  return coordinate;
}

/**
 * Check if maps are supported on web platform
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
 * Get Polyline component for web platform
 */
export function getPolylineComponent(): any {
  try {
    const WebMaps = require("@teovilla/react-native-web-maps");
    return WebMaps.Polyline || null;
  } catch (error) {
    console.warn("Web Polyline not available:", error);
    return null;
  }
}

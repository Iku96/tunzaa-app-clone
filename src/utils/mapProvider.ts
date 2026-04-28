/**
 * Cross-platform map provider - SAFE fallback version
 * This file should never import native modules to avoid Metro conflicts
 */

import { Platform } from "react-native";

// Re-export types that are common
export interface MapComponents {
  MapView: any;
  Marker: any;
  isAvailable: boolean;
  provider: "expo-maps" | "react-native-maps" | "react-native-web-maps" | "none";
  PROVIDER_GOOGLE?: any;
}

// Safe fallback implementations that don't import any native modules
export function getMapComponents(): MapComponents {
  console.warn("⚠️ Using fallback mapProvider - platform-specific file not resolved");
  return {
    MapView: null,
    Marker: null,
    isAvailable: false,
    provider: "none",
    PROVIDER_GOOGLE: undefined,
  };
}

export function getMapProps(baseProps: any) {
  console.warn("⚠️ Using fallback mapProvider - platform-specific file not resolved");
  return baseProps;
}

export function handleMapPress(event: any) {
  console.warn("⚠️ Using fallback mapProvider - platform-specific file not resolved");
  return null;
}

export function isMapsSupported(): boolean {
  return false;
}

export function getMapProvider(): string {
  return "none";
}

export function getGoogleMapsApiKey(): string {
  return "";
}

export function isGoogleMapsApiKeyConfigured(): boolean {
  return false;
}

export function getPolylineComponent(): any {
  console.warn("⚠️ Using fallback mapProvider - platform-specific file not resolved");
  return null;
}

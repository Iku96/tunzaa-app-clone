import * as Location from "expo-location";
import { Platform, Alert, Linking } from "react-native";
import { API_CONFIG } from "./config";

export interface NavigationCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: NavigationCoordinate[];
  legs: RouteLeg[];
}

export interface RouteLeg {
  distance: number;
  duration: number;
  startAddress: string;
  endAddress: string;
  startLocation: NavigationCoordinate;
  endLocation: NavigationCoordinate;
}

export interface NavigationOptions {
  origin: NavigationCoordinate;
  waypoints: NavigationCoordinate[];
  destination: NavigationCoordinate;
  mode?: "driving" | "walking" | "transit";
}

export class NavigationService {
  private static instance: NavigationService;
  private hasLocationPermission = false;

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Request location permissions
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasLocationPermission = status === "granted";

      if (!this.hasLocationPermission) {
        Alert.alert(
          "Location Permission Required",
          "Navigation requires location access to provide turn-by-turn directions.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }

      return this.hasLocationPermission;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  /**
   * Get current GPS location
   */
  async getCurrentLocation(): Promise<NavigationCoordinate | null> {
    try {
      if (!this.hasLocationPermission) {
        const hasPermission = await this.requestLocationPermissions();
        if (!hasPermission) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);

      // Show user-friendly error
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please check if location services are enabled.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => this.getCurrentLocation() },
        ]
      );

      return null;
    }
  }

  /**
   * Get route using Google Routes API
   */
  async getRoute(options: NavigationOptions): Promise<RouteInfo | null> {
    try {
      const { origin, waypoints, destination, mode = "driving" } = options;

      // Construct waypoints string
      const waypointsStr = waypoints
        .map((wp) => `${wp.latitude},${wp.longitude}`)
        .join("|");

      const url =
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        (waypoints.length > 0 ? `&waypoints=${waypointsStr}` : "") +
        `&mode=${mode}` +
        `&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(
          `Directions API error: ${data.status} - ${
            data.error_message || "Unknown error"
          }`
        );
      }

      const route = data.routes[0];
      if (!route) {
        throw new Error("No route found");
      }

      // Decode polyline
      const polyline = this.decodePolyline(route.overview_polyline.points);

      // Parse legs
      const legs: RouteLeg[] = route.legs.map((leg: any) => ({
        distance: leg.distance.value,
        duration: leg.duration.value,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        startLocation: {
          latitude: leg.start_location.lat,
          longitude: leg.start_location.lng,
        },
        endLocation: {
          latitude: leg.end_location.lat,
          longitude: leg.end_location.lng,
        },
      }));

      return {
        distance: route.legs.reduce(
          (sum: number, leg: any) => sum + leg.distance.value,
          0
        ),
        duration: route.legs.reduce(
          (sum: number, leg: any) => sum + leg.duration.value,
          0
        ),
        polyline,
        legs,
      };
    } catch (error) {
      console.error("Error getting route:", error);

      Alert.alert(
        "Route Error",
        "Unable to calculate route. Please try again.",
        [{ text: "OK" }]
      );

      return null;
    }
  }

  /**
   * Launch external navigation app
   */
  async launchExternalNavigation(options: NavigationOptions): Promise<boolean> {
    try {
      const { origin, waypoints, destination } = options;

      // Construct waypoints for external maps
      const waypointsStr =
        waypoints.length > 0
          ? waypoints.map((wp) => `${wp.latitude},${wp.longitude}`).join("/")
          : "";

      let url: string;

      if (Platform.OS === "ios") {
        // Use Apple Maps on iOS
        url =
          `maps://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}` +
          `&daddr=${destination.latitude},${destination.longitude}` +
          (waypointsStr ? `&waypoints=${waypointsStr}` : "") +
          `&dirflg=d`; // d = driving directions
      } else {
        // Use Google Maps on Android
        url =
          `google.navigation:q=${destination.latitude},${destination.longitude}` +
          (waypointsStr ? `&waypoints=${waypointsStr}` : "") +
          `&mode=d`; // d = driving
      }

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web Google Maps
        const webUrl =
          `https://www.google.com/maps/dir/` +
          `${origin.latitude},${origin.longitude}/` +
          (waypointsStr ? `${waypointsStr}/` : "") +
          `${destination.latitude},${destination.longitude}`;

        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error("Error launching external navigation:", error);

      Alert.alert(
        "Navigation Error",
        "Unable to open navigation app. Please try again.",
        [{ text: "OK" }]
      );

      return false;
    }
  }

  /**
   * Show navigation options to user
   */
  async showNavigationOptions(options: NavigationOptions): Promise<void> {
    Alert.alert("Navigation Options", "How would you like to navigate?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "External App",
        onPress: () => this.launchExternalNavigation(options),
      },
      // Note: In-app navigation would require additional native SDK integration
      // This would be implemented based on the specific navigation SDK being used
    ]);
  }

  /**
   * Decode Google Maps polyline
   */
  private decodePolyline(encoded: string): NavigationCoordinate[] {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return poly;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters)} m`;
    }
  }
}

export const navigationService = NavigationService.getInstance();

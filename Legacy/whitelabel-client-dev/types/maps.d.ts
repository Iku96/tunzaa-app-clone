// Type definitions for platform-specific map components

export interface MapViewProps {
  style?: any;
  region?: Region;
  initialRegion?: Region;
  onPress?: (event: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  onRegionChangeComplete?: (region: Region) => void;
  children?: React.ReactNode;
}

export interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapEvent {
  nativeEvent: {
    coordinate?: {
      latitude: number;
      longitude: number;
    };
    latLng?: {
      latitude: number;
      longitude: number;
    };
  };
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}

// Platform-specific map component interfaces
export interface ExpoMapView extends React.ComponentType<MapViewProps> {}
export interface ExpoMarker extends React.ComponentType<MarkerProps> {}

export interface RNMapView extends React.ComponentType<MapViewProps> {}
export interface RNMarker extends React.ComponentType<MarkerProps> {}

export interface WebMapView extends React.ComponentType<MapViewProps> {}
export interface WebMarker extends React.ComponentType<MarkerProps> {}

// Unified map interfaces for our components
export interface MapComponent {
  MapView: React.ComponentType<MapViewProps>;
  Marker: React.ComponentType<MarkerProps>;
}

declare module "expo-maps" {
  export const MapView: ExpoMapView;
  export const Marker: ExpoMarker;
}

declare module "react-native-maps" {
  const MapView: RNMapView;
  export { MapView as default };
  export const Marker: RNMarker;
}

declare module "@teovilla/react-native-web-maps" {
  const MapView: WebMapView;
  export { MapView as default };
  export const Marker: WebMarker;
}

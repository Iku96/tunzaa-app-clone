import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Alert,
  Platform,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  SafeAreaView,
  Modal,
  Keyboard,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { MapPin, X, Search } from "lucide-react-native";
import { Button } from "./button";
import { Text } from "./text";
import { cn } from "@/lib/utils";
import {
  getMapComponents,
  getMapProps,
  handleMapPress,
  isMapsSupported,
  getMapProvider,
} from "@/utils/mapProvider";
import {
  GooglePlacesAutocompleteComponent,
  GooglePlacesAutocompleteHandle,
  LocationData as GoogleLocationData,
} from "@/components/ui/google-places-autocomplete";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/hooks/useI18n";
import { API_CONFIG } from "@/services/config";

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

interface LocationPickerProps {
  value?: LocationData;
  onLocationSelected: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showCurrentLocationButton?: boolean;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface SearchResult {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export function LocationPicker({
  value,
  onLocationSelected,
  placeholder,
  className,
  disabled = false,
  showCurrentLocationButton = true,
}: LocationPickerProps) {
  const { t } = useI18n();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    value || null
  );
  const [tempLocation, setTempLocation] = useState<LocationData | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const isWeb = Platform.OS === "web";
  const resolvedColors = useResolvedThemeColors();
  const defaultPlaceholder = placeholder || t("ui.location_picker.select_location");
  // Default region - Dar es Salaam coordinates
  const [region, setRegion] = useState<Region>({
    latitude: -6.7924,
    longitude: 39.2083,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Refs for components
  const googlePlacesRef = useRef<GooglePlacesAutocompleteHandle>(null);
  const mapRef = useRef<any>(null);

  // Get map components with error handling
  let MapView: any = null;
  let Marker: any = null;
  let mapsAvailable = false;

  try {
    const mapComponents = getMapComponents();
    MapView = mapComponents.MapView;
    Marker = mapComponents.Marker;
    mapsAvailable = mapComponents.isAvailable && Boolean(MapView);
  } catch (error) {
    console.warn("Error getting map components:", error);
    mapsAvailable = false;
  }

  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setTempLocation(value);
      setRegion({
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setIsSearchMode(false);
    }
  }, [value]);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Focus input when dialog/modal opens in search mode
  useEffect(() => {
    if (isDialogVisible && isSearchMode) {
      setTimeout(() => {
        googlePlacesRef.current?.focus();
      }, 300);
    }
  }, [isDialogVisible, isSearchMode]);

  // Enhanced zoom function with better precision and animation
  const zoomToLocation = (
    location: LocationData,
    zoomLevel: number = 0.005
  ) => {
    const newRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: zoomLevel,
      longitudeDelta: zoomLevel,
    };

    setRegion(newRegion);

    if (mapRef.current) {
      try {
        if (Platform.OS === "ios") {
          if (mapRef.current.animateToRegion) {
            mapRef.current.animateToRegion(newRegion, 800);
          } else if (mapRef.current.animateCamera) {
            mapRef.current.animateCamera(
              {
                center: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                zoom: Math.max(15, Math.round(-Math.log2(zoomLevel) + 8)),
              },
              { duration: 800 }
            );
          }
        } else if (Platform.OS === "android") {
          if (mapRef.current.animateToRegion) {
            mapRef.current.animateToRegion(newRegion, 800);
          } else if (mapRef.current.animateCamera) {
            mapRef.current.animateCamera(
              {
                center: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                zoom: Math.max(15, Math.round(-Math.log2(zoomLevel) + 8)),
              },
              { duration: 800 }
            );
          }
        } else if (Platform.OS === "web") {
          if (mapRef.current.setCamera) {
            mapRef.current.setCamera({
              center: { lat: location.latitude, lng: location.longitude },
              zoom: Math.max(15, Math.round(-Math.log2(zoomLevel) + 8)),
            });
          } else if (mapRef.current.panTo) {
            mapRef.current.panTo({
              lat: location.latitude,
              lng: location.longitude,
            });
            if (mapRef.current.setZoom) {
              mapRef.current.setZoom(
                Math.max(15, Math.round(-Math.log2(zoomLevel) + 8))
              );
            }
          }
        }
      } catch (error) {
        console.warn("Error animating to location:", error);
        setRegion(newRegion);
      }
    }
  };

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is required to use this feature.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  };

  // super-simple, bulletproof extractor
  const simpleGeocodeExtract = (geo: any) => {
    if (!geo?.results?.length) return null;

    // prefer precise address if available
    const r =
      geo.results.find((res: any) =>
        res.types?.some((t: string) =>
          ["street_address", "premise", "route"].includes(t)
        )
      ) || geo.results[0];

    const loc = r.geometry?.location;
    const toNum = (v: unknown): number | null =>
      typeof v === "number" ? v : v != null && !isNaN(Number(v)) ? Number(v) : null;

    const getComponent = (type: string) =>
      r.address_components?.find((c: any) => c.types?.includes(type))?.long_name || null;

    return {
      address: typeof r.formatted_address === "string" ? r.formatted_address : null,
      city:
        getComponent("locality") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postalCode: getComponent("postal_code"),
    };
  }



  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return;

    try {
      setIsGettingCurrentLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = addresses[0];
        const locationData: LocationData = {
          latitude,
          longitude,
          address: address
            ? `${address.street || ""} ${address.streetNumber || ""}`.trim()
            : "Current Location",
          city: address?.city || "",
          country: address?.country || "",
          postalCode: address?.postalCode || "",
        };

        setTempLocation(locationData);
        zoomToLocation(locationData, 0.003);
        setIsSearchMode(false);
        setSearchQuery(locationData.address || "Current Location");
      } catch (reverseGeocodeError) {
        console.warn(
          "Error reverse geocoding current location:",
          reverseGeocodeError
        );

        let fallbackLocation: LocationData = {
          latitude: latitude,
          longitude: longitude,
          address: "Current Location",
          city: "",
          country: "",
          postalCode: "",
        };

        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + API_CONFIG.GOOGLE_MAPS_API_KEY)
          .then((response) => response.json())
          .then((responseJson) => {
            console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson));
            const extractedLocation = simpleGeocodeExtract(responseJson);
            if (responseJson) {
              fallbackLocation.address = extractedLocation?.address || "Current Location";
              fallbackLocation.city = extractedLocation?.city || "";
              fallbackLocation.country = extractedLocation?.country || "";
              fallbackLocation.postalCode = extractedLocation?.postalCode || "";
            }
          })
          .catch((error) => {
            console.error('Error fetching address:', error);

          });


        setTempLocation(fallbackLocation);
        zoomToLocation(fallbackLocation, 0.003);
        setIsSearchMode(false);
        setSearchQuery("Current Location");
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Failed to get current location. Please try again.");
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const onMapPress = async (event: any) => {
    // Prevent map press when dropdown is visible (Android issue fix)
    if (isDropdownVisible) {
      return;
    }

    const coordinate = handleMapPress(event);

    if (!coordinate) {
      return;
    }

    const { latitude, longitude } = coordinate;

    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addresses[0];

      // Build a comprehensive address string from available components
      const buildAddressString = (addr: any): string => {
        if (!addr) return "Selected Location";

        const parts: string[] = [];

        // Add street number and name
        if (addr.streetNumber) parts.push(addr.streetNumber);
        if (addr.street) parts.push(addr.street);

        // If we have street info, use it
        if (parts.length > 0) {
          const streetAddress = parts.join(" ");
          // Add district/subdistrict if available
          if (addr.district) {
            return `${streetAddress}, ${addr.district}`;
          }
          return streetAddress;
        }

        // Fallback to other available fields
        if (addr.name) return addr.name;
        if (addr.district) return addr.district;
        if (addr.subregion) return addr.subregion;
        if (addr.region) return addr.region;

        // Last resort: use formatted address if available
        if (addr.formattedAddress) return addr.formattedAddress;

        return "Selected Location";
      };

      const locationData: LocationData = {
        latitude,
        longitude,
        address: buildAddressString(address),
        city: address?.city || address?.subregion || "",
        country: address?.country || "",
        postalCode: address?.postalCode || "",
      };

      setTempLocation(locationData);
      setSearchQuery(locationData.address || "Selected Location");
      setIsSearchMode(false);
      setIsInputFocused(false);
      zoomToLocation(locationData, 0.002);
    } catch (error) {
      console.error("Error reverse geocoding:", error);

      const fallbackLocation: LocationData = {
        latitude,
        longitude,
        address: "Selected Location",
        city: "",
        country: "",
        postalCode: "",
      };

      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
      )
        .then((response) => response.json())
        .then((responseJson) => {
          // console.log("ADDRESS GEOCODE is BACK!! =>", responseJson);

          const extractedLocation = simpleGeocodeExtract(responseJson);
          // console.log("EXTRACTED LOCATION =>", extractedLocation);

          const updatedLocation: LocationData = {
            ...fallbackLocation,
            address: extractedLocation?.address || "Selected Location",
            city: extractedLocation?.city || "",
            country: extractedLocation?.country || "",
            postalCode: extractedLocation?.postalCode || "",
          };

          // ✅ Now update state AFTER the API returns
          setTempLocation(updatedLocation);
          setSearchQuery(updatedLocation?.address || "Selected Location");
          setIsSearchMode(false);
          setIsInputFocused(false);
          zoomToLocation(updatedLocation, 0.002);
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
          // Still update UI with fallback
          setTempLocation(fallbackLocation);
          setSearchQuery(fallbackLocation?.address || "Selected Location");
          setIsSearchMode(false);
          setIsInputFocused(false);
          zoomToLocation(fallbackLocation, 0.002);
        });
    }

  };

  const handleGooglePlacesSelect = useCallback(
    (location: GoogleLocationData) => {
      const locationData: LocationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        country: location.country,
        postalCode: location.postalCode,
      };

      setTempLocation(locationData);
      setSearchQuery(location.address || "Selected Location");
      setIsSearchMode(false);
      setIsDropdownVisible(false); // Hide dropdown after selection
      setIsInputFocused(false);
      zoomToLocation(locationData, 0.001);
      googlePlacesRef.current?.blur();
    },
    []
  );

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) => (
      <Text
        key={index}
        className={cn(
          part.toLowerCase() === query.toLowerCase()
            ? "text-green-600 font-semibold"
            : "text-foreground"
        )}
      >
        {part}
      </Text>
    ));
  };

  const handleConfirm = () => {
    const locationToSave = tempLocation || selectedLocation;
    if (locationToSave) {
      setSelectedLocation(locationToSave);
      onLocationSelected(locationToSave);
      setIsDialogVisible(false);
      setTempLocation(null);
      setSearchQuery("");
      setIsSearchMode(true);
      setIsInputFocused(false);
    }
  };

  const handleCancel = () => {
    setIsDialogVisible(false);
    setTempLocation(null);
    setSearchQuery("");
    setIsSearchMode(true);
    setIsInputFocused(false);
  };

  const handleSearchInputPress = () => {
    if (!isSearchMode) {
      setIsSearchMode(true);
      setSearchQuery("");
      setIsInputFocused(true);
      setTimeout(() => {
        googlePlacesRef.current?.focus();
      }, 100);
    }
  };

  const getDisplayText = () => {
    if (!selectedLocation) return defaultPlaceholder;

    const parts = [];
    if (selectedLocation.address) parts.push(selectedLocation.address);
    if (selectedLocation.city) parts.push(selectedLocation.city);

    return parts.length > 0
      ? parts.join(", ")
      : `${selectedLocation.latitude.toFixed(
        4
      )}, ${selectedLocation.longitude.toFixed(4)}`;
  };

  // If MapView is not available, show a simple input fallback
  if (!mapsAvailable || !MapView) {
    return (
      <Button
        variant="outline"
        onPress={() =>
          !disabled &&
          Alert.alert(
            "Map Not Available",
            `Map functionality is not available on this platform. Current provider: ${getMapProvider()}`
          )
        }
        disabled={disabled}
        className={cn(
          "w-full justify-start h-12 px-3",
          !selectedLocation && "text-muted-foreground",
          className
        )}
      >
        <View className="flex-row items-center gap-2 flex-1">
          <MapPin
            size={20}
            className={selectedLocation ? "text-primary" : "text-foreground"}
            color={selectedLocation ? resolvedColors?.primary || "#000000" : resolvedColors?.foreground || "#000000"}
          />
          <Text
            className={cn(
              "flex-1 text-left",
              selectedLocation ? "text-foreground" : "text-muted-foreground"
            )}
            numberOfLines={1}
          >
            {getDisplayText()}
          </Text>
        </View>
      </Button>
    );
  }

  // Get platform-specific map props
  const baseMapProps = {
    style: { flex: 1 },
    region: region,
    onPress: onMapPress,
    showsUserLocation: true,
    showsMyLocationButton: false,
    mapType: "standard" as const,
    loadingEnabled: true,
    loadingIndicatorColor: "#3b82f6",
    loadingBackgroundColor: "#f8fafc",
  };

  const mapProps = getMapProps(baseMapProps);
  const shouldHideMap = isSearchMode && (isKeyboardVisible || isDropdownVisible);
  const hasConfirmableLocation = Boolean(tempLocation || selectedLocation);

  // Modal content shared between platforms
  const modalContent = (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="p-4 flex-row items-center justify-between border-b border-border">
            <Text className="text-lg font-semibold text-foreground">
              Your Location
            </Text>
            <Button
              variant="ghost"
              size="icon"
              onPress={handleCancel}
            >
              <X size={24} className="text-foreground" color={resolvedColors?.foreground} />
            </Button>
          </View>

          {/* Description */}
          {/* <View className="px-4 py-2">
            <Text className="text-sm text-muted-foreground">
              Select a location on the map or search for an address.
            </Text>
          </View> */}

          {/* Map Background */}
          <View className="flex-1 relative overflow-hidden">
            {MapView ? (
              shouldHideMap ? (
                <View className="absolute inset-0 items-center justify-center bg-muted/20 border-b border-border/20">
                  <Text className="text-muted-foreground text-center px-6">
                    {isKeyboardVisible
                      ? "Type your location to see it on the map or tap the location icon to get your current location."
                      : "Type in a location."}
                  </Text>
                </View>
              ) : (
                <View className="absolute inset-0">
                  <MapView
                    ref={mapRef}
                    pointerEvents={isDropdownVisible ? "none" : "auto"}
                    {...mapProps}
                  >
                    {tempLocation && Marker && (
                      <Marker
                        coordinate={{
                          latitude: tempLocation.latitude,
                          longitude: tempLocation.longitude,
                        }}
                        title="Selected Location"
                        description={tempLocation.address}
                        pinColor="#ef4444"
                      />
                    )}
                  </MapView>
                  {isDropdownVisible && (
                    <View
                      className="absolute inset-0 z-10"
                      pointerEvents="auto"
                      onStartShouldSetResponder={() => true}
                    />
                  )}
                </View>
              )
            ) : (
              <View className="absolute inset-0 items-center justify-center bg-muted/20">
                <MapPin size={48} className="text-muted-foreground mb-4" />
                <Text className="text-muted-foreground text-center">
                  Map not available
                </Text>
                <Text className="text-sm text-muted-foreground text-center mt-1">
                  Provider: {getMapProvider()}
                </Text>
              </View>
            )}

            {/* Search Input */}
            <View className="absolute top-2 left-2 right-2 z-20 bg-background/80 backdrop-blur-sm p-3 rounded-xl border border-border/20 overflow-visible">
              <View
                className={cn(
                  "flex-row items-center bg-white rounded-lg px-3 py-2 shadow-sm transition-all",
                  isInputFocused ? "border-2 border-primary shadow-lg" : "border border-border"
                )}
              >
                <Search size={20} className="text-muted-foreground mr-3" />
                {isSearchMode ? (
                  <View className="flex-1 min-h-[24px] relative">
                    <GooglePlacesAutocompleteComponent
                      ref={googlePlacesRef}
                      onLocationSelected={handleGooglePlacesSelect}
                      placeholder="Search for a location..."
                      showCurrentLocationButton={false}
                      minLength={2}
                      debounce={400}
                      onDropdownVisibilityChange={setIsDropdownVisible}
                      onInputFocusChange={setIsInputFocused}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={handleSearchInputPress}
                    className="flex-1"
                  >
                    <Text className="text-foreground" numberOfLines={1}>
                      {searchQuery || tempLocation?.address || "Selected location"}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={getCurrentLocation}
                  disabled={isGettingCurrentLocation}
                  className="ml-2 p-1"
                >
                  {isGettingCurrentLocation ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <MapPin size={20} className="text-primary" />
                  )}
                </Pressable>
              </View>
            </View>

          </View>

          {/* Selected Location Info */}
          {!isSearchMode && tempLocation && (
            <View className="p-4 bg-white border-t border-border/20">
              <View className="flex-row items-start gap-3">
                <MapPin size={20} className="text-primary mt-1" />
                <View className="flex-1">
                  <Text className="text-base font-bold text-muted-foreground">
                    {tempLocation.address || "Selected Location"}
                  </Text>
                  {tempLocation.city && (
                    <Text className="text-sm text-muted-foreground mt-1">
                      {tempLocation.city}
                      {tempLocation.country && `, ${tempLocation.country}`}
                    </Text>
                  )}
                  <Text className="text-xs text-muted-foreground mt-2">
                    {tempLocation.latitude.toFixed(6)},{" "}
                    {tempLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Footer */}
          {hasConfirmableLocation && (
            <View className="p-4 flex-row justify-end gap-2 border-t border-border/20">
              <Button variant="outline" onPress={handleCancel}>
                <Text>Cancel</Text>
              </Button>
              <Button
                variant="primary"
                onPress={handleConfirm}
                disabled={!hasConfirmableLocation}
              >
                <Text>Confirm Location</Text>
              </Button>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <>
      <Button
        variant="outline"
        onPress={() => !disabled && MapView && setIsDialogVisible(true)}
        disabled={disabled || !MapView}
        className={cn(
          "w-full justify-start h-12 px-3",
          !selectedLocation && "text-muted-foreground",
          className
        )}
      >
        <View className="flex-row items-center gap-2 flex-1">
          <MapPin
            size={20}
            className={selectedLocation ? "text-primary" : "text-muted-foreground"}
            color={selectedLocation ? resolvedColors?.primary || "#000000" : resolvedColors?.foreground || "#000000"}
          />
          <Text
            className={cn(
              "flex-1 text-left",
              selectedLocation ? "text-foreground" : "text-muted-foreground"
            )}
            numberOfLines={1}
          >
            {getDisplayText()}
          </Text>
        </View>
      </Button>

      {isWeb ? (
        <Dialog open={isDialogVisible} onOpenChange={setIsDialogVisible}>
          <DialogContent className="rounded-xl bg-background h-[85vh] w-[80vw] p-0 overflow-hidden">
            {modalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Modal
          visible={isDialogVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCancel}
        >
          {modalContent}
        </Modal>
      )}
    </>
  );
}
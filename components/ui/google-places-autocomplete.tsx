// GooglePlacesAutocompleteComponent.tsx
// Custom wrapper with platform-specific implementations

import "react-native-get-random-values";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  View,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { API_CONFIG } from "@/src/services/config";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

// Conditional import for native platforms only
let GooglePlacesAutocompleteNative: any = null;
if (Platform.OS !== "web") {
  try {
    GooglePlacesAutocompleteNative = require("react-native-google-places-autocomplete").GooglePlacesAutocomplete;
  } catch (error) {
    console.warn("react-native-google-places-autocomplete not available:", error);
  }
}

// Interfaces and types
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  placeId?: string;
}

export type PlaceType = 'geocode' | 'address' | 'establishment' | '(regions)' | '(cities)';

interface GooglePlacesAutocompleteProps {
  onLocationSelected: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showCurrentLocationButton?: boolean;
  minLength?: number;
  debounce?: number;
  defaultValue?: string;
  /** 
   * Restrict results to specific place types.
   * - 'geocode': Street addresses and administrative areas (default, most restrictive)
   * - 'address': Precise street addresses
   * - 'establishment': Businesses, landmarks, and named places
   * - '(regions)': Geographic regions (cities, countries, etc.)
   * - '(cities)': Cities only
   * - undefined: No restriction, returns all types (recommended for best results)
   */
  types?: PlaceType | PlaceType[];
  /** 
   * Callback when dropdown visibility changes
   * Used to prevent map interactions when dropdown is visible
   */
  onDropdownVisibilityChange?: (isVisible: boolean) => void;
  /**
   * Callback when the search input gains or loses focus
   * Useful for styling parent containers
   */
  onInputFocusChange?: (isFocused: boolean) => void;
}

export interface GooglePlacesAutocompleteHandle {
  setAddressText: (text: string) => void;
  getAddressText: () => string;
  clear: () => void;
  focus: () => void;
  blur: () => void;
}

// Web-specific interfaces
interface GooglePlacesPrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
}

// Global types for Google Maps JavaScript API
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                types: string[];
                componentRestrictions: { country: string[] };
              },
              callback: (
                predictions: GooglePlacesPrediction[] | null,
                status: string
              ) => void
            ) => void;
          };
          PlacesService: new (map: HTMLDivElement) => {
            getDetails: (
              request: { placeId: string },
              callback: (place: any, status: string) => void
            ) => void;
          };
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

// Native implementation
const NativeGooglePlacesAutocomplete = forwardRef<
  GooglePlacesAutocompleteHandle,
  GooglePlacesAutocompleteProps
>((props, ref) => {
  const GooglePlacesAutocomplete = GooglePlacesAutocompleteNative;

  const {
    onLocationSelected,
    placeholder = "Search for a location...",
    className,
    disabled = false,
    showCurrentLocationButton = true,
    minLength = 2,
    debounce = 400,
    defaultValue = "",
    types, // No default - will return all types if undefined
    onDropdownVisibilityChange,
    onInputFocusChange,
  } = props;

  const googlePlacesRef = useRef<any>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const resolvedColors = useResolvedThemeColors();
  useImperativeHandle(ref, () => ({
    setAddressText: (text: string) => {
      googlePlacesRef.current?.setAddressText(text);
    },
    getAddressText: () => {
      return googlePlacesRef.current?.getAddressText() || "";
    },
    clear: () => {
      googlePlacesRef.current?.clear();
      setCurrentQuery("");
    },
    focus: () => {
      googlePlacesRef.current?.focus();
    },
    blur: () => {
      googlePlacesRef.current?.blur();
    },
  }));

  const parseAddressComponents = (addressComponents: any[]) => {
    let city = "";
    let country = "";
    let postalCode = "";

    addressComponents.forEach((component) => {
      if (
        component.types.includes("locality") ||
        component.types.includes("administrative_area_level_2")
      ) {
        city = component.long_name;
      }
      if (component.types.includes("country")) {
        country = component.long_name;
      }
      if (component.types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    });

    return { city, country, postalCode };
  };

  const handlePlaceSelect = useCallback(
    (data: any, details: any) => {
      if (!details) {
        console.warn("No details provided for place selection");
        return;
      }

      if (!details.geometry || !details.geometry.location) {
        console.warn("No geometry data available for selected place");
        return;
      }

      try {
        const { city, country, postalCode } = parseAddressComponents(
          details.address_components || []
        );

        const locationData: LocationData = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address:
            details.formatted_address || data.description || "Unknown Location",
          city,
          country,
          postalCode,
          placeId: details.place_id,
        };

        onLocationSelected(locationData);
        onInputFocusChange?.(false);
      } catch (error) {
        console.error("Error processing place selection:", error);
        const fallbackData: LocationData = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address: data.description || "Selected Location",
        };
        onLocationSelected(fallbackData);
      }
    },
    [onLocationSelected]
  );

  const highlightText = (text: string, query: string) => {
    if (!query.trim())
      return <Text className="text-foreground text-sm">{text}</Text>;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <Text className="text-foreground text-sm">
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          return (
            <Text
              key={index}
              style={{
                color: isMatch ? "#059669" : resolvedColors?.foreground,
                fontWeight: isMatch ? "600" : "400",
                fontSize: 14,
              }}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key not configured");
    return (
      <View className={cn("flex-1", className)}>
        <Text className="text-red-500 text-sm p-2">
          Google Maps API key not configured
        </Text>
      </View>
    );
  }

  if (!GooglePlacesAutocomplete) {
    return (
      <View className={cn("flex-1", className)}>
        <Text className="text-red-500 text-sm p-2">
          Location search unavailable
        </Text>
        <Text className="text-muted-foreground text-xs p-2">
          Please check that react-native-google-places-autocomplete is installed
        </Text>
      </View>
    );
  }

  return (
    <View className={cn("flex-1", className)}>
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder={placeholder}
        minLength={minLength}
        fetchDetails={true}
        onPress={handlePlaceSelect}
        debounce={debounce}
        currentLocation={showCurrentLocationButton}
        currentLocationLabel="Current location"
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesDetailsQuery={{
          fields:
            "formatted_address,geometry,name,place_id,types,address_components",
        }}
        filterReverseGeocodingByTypes={[
          "locality",
          "administrative_area_level_3",
          "administrative_area_level_2",
          "administrative_area_level_1",
          "country",
          "postal_code",
          "street_address",
          "sublocality",
          "sublocality_level_1",
        ]}
        disableScroll={true}
        keyboardShouldPersistTaps="handled"
        query={{
          key: API_CONFIG.GOOGLE_MAPS_API_KEY,
          language: "en",
          ...(types && { types: Array.isArray(types) ? types.join('|') : types }),
          components: "country:tz",
        }}
        timeout={20000}
        listEmptyComponent={() => <View />}
        numberOfLines={1}
        styles={{
          container: {
            flex: 1,
            position: "relative",
            zIndex: 1,
            
          },
          textInputContainer: {
            flexDirection: "row",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            marginTop: 0,
            marginBottom: 0,
            
          },
          textInput: {
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
            marginTop: 0,
            paddingBottom: 0,
            height: 24,
            color: "#1f2937",
            fontSize: 15,
            borderRadius: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            backgroundColor: "transparent",
            borderWidth: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          },
          poweredContainer: {
            display: "none",
          },
          listView: {
            // backgroundColor: resolvedColors?.backgroundWithOpacity(0.5),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: resolvedColors?.border,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            maxHeight: 320,
            marginTop: 0,
            position: "absolute",
            top: 36,
            left: -32,
            right: -46,
            // width: "100%",
            zIndex: 1000,
          },
          rowContainer: {
            backgroundColor: resolvedColors?.backgroundWithOpacity(0.5),
          },
          
          row: {
            // backgroundColor: resolvedColors?.backgroundWithOpacity(0.5),
            padding:0,
            minHeight: 56,
            flexDirection: "row",
            alignItems: "flex-start",
            // borderBottomWidth: 0.5,
            // borderBottomColor: resolvedColors?.border,
          },
          separator: {
            height: 0.5,
            backgroundColor: resolvedColors?.border,
          },
          description: {
            fontSize: 14,
            color: resolvedColors?.foreground,
            flex: 1,
            fontWeight: "400",
            lineHeight: 20,
          },
          loader: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: 40,
            backgroundColor: resolvedColors?.background,
          },
        }}
        textInputProps={{
          placeholderTextColor: resolvedColors?.mutedForeground,
          selectionColor: "#3b82f6",
          editable: !disabled,
          returnKeyType: "search",
          autoComplete: "off",
          autoCorrect: false,
          spellCheck: false,
          onChangeText: (text: string) => setCurrentQuery(text),
        }}
        enablePoweredByContainer={false}
        suppressDefaultStyles={false}
        keepResultsAfterBlur={false}
        predefinedPlaces={[]}
        predefinedPlacesAlwaysVisible={false}
        listViewDisplayed="auto"
        renderLeftButton={() => null}
        renderRightButton={() => null}
        onFocus={() => {
          onDropdownVisibilityChange?.(true);
          onInputFocusChange?.(true);
        }}
        onBlur={() => {
          // Delay to allow selection
          setTimeout(() => {
            onDropdownVisibilityChange?.(false);
            onInputFocusChange?.(false);
          }, 200);
        }}
        renderRow={(rowData: any) => (
          <View
            style={{
              backgroundColor: resolvedColors?.background,
              padding: 16,
              minHeight: 56,
              flexDirection: "row",
              alignItems: "flex-start",
              borderBottomWidth: 0.5,
              borderBottomColor: resolvedColors?.border,
            }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              {highlightText(
                rowData.description ||
                  rowData.structured_formatting?.main_text ||
                  "Unknown location",
                currentQuery
              )}
              {rowData.structured_formatting?.secondary_text && (
                <Text
                  style={{
                    fontSize: 12,
                    color: resolvedColors?.mutedForeground,
                    marginTop: 4,
                    lineHeight: 16,
                  }}
                >
                  {rowData.structured_formatting.secondary_text}
                </Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
});

// Web implementation using Google Places JavaScript API
const WebGooglePlacesAutocomplete = forwardRef<
  GooglePlacesAutocompleteHandle,
  GooglePlacesAutocompleteProps
>(
  (
    {
      onLocationSelected,
      placeholder = "Search for a location...",
      className,
      disabled = false,
      showCurrentLocationButton = true,
      minLength = 2,
      debounce = 400,
      defaultValue = "",
      types, // No default - will return all types if undefined
      onDropdownVisibilityChange,
      onInputFocusChange,
    },
    ref
  ) => {
    const [query, setQuery] = useState(defaultValue);
    const [predictions, setPredictions] = useState<GooglePlacesPrediction[]>(
      []
    );
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const debounceTimeoutRef = useRef<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const resolvedColors = useResolvedThemeColors();
    // Load Google Maps JavaScript API
    useEffect(() => {
      if (typeof window !== "undefined") {
        // Check if Google API is already loaded with places library
        if (window.google?.maps?.places) {
          setIsGoogleLoaded(true);
          return;
        }

        // If Google API is not loaded, load it
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const callbackName = `initGoogleMaps_${Date.now()}`;
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
          script.async = true;
          script.defer = true;

          // Create a unique global callback function
          (window as any)[callbackName] = () => {
            if (window.google?.maps?.places) {
              setIsGoogleLoaded(true);
              // Clean up the callback
              delete (window as any)[callbackName];
            }
          };

          script.onerror = () => {
            console.error("Failed to load Google Maps API");
            // Clean up the callback on error
            delete (window as any)[callbackName];
          };

          document.head.appendChild(script);
        }
      }
    }, []);

    useImperativeHandle(ref, () => ({
      setAddressText: (text: string) => {
        setQuery(text);
      },
      getAddressText: () => {
        return query;
      },
      clear: () => {
        setQuery("");
        setPredictions([]);
        setShowSuggestions(false);
      },
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
    }));

    const searchPlaces = useCallback(
      async (searchQuery: string) => {
        if (
          !searchQuery ||
          searchQuery.length < minLength ||
          !isGoogleLoaded ||
          !window.google?.maps?.places
        ) {
          setPredictions([]);
          setShowSuggestions(false);
          return;
        }

        try {
          setLoading(true);

          // Double-check that the AutocompleteService is available
          if (!window.google.maps.places.AutocompleteService) {
            console.warn("AutocompleteService not available");
            setLoading(false);
            return;
          }

          const service = new window.google.maps.places.AutocompleteService();

          const requestParams: any = {
            input: searchQuery,
            componentRestrictions: { country: ["tz"] },
          };

          // Only add types if specified
          if (types) {
            requestParams.types = Array.isArray(types) ? types : [types];
          }

          service.getPlacePredictions(
            requestParams,
            (predictions, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
              setPredictions(predictions);
              setShowSuggestions(true);
              onDropdownVisibilityChange?.(true);
              } else {
                console.warn("Places API status:", status);
                setPredictions([]);
                setShowSuggestions(false);
              }
              setLoading(false);
            }
          );
        } catch (error) {
          console.error("Error fetching places:", error);
          setPredictions([]);
          setShowSuggestions(false);
          setLoading(false);
        }
      },
      [minLength, isGoogleLoaded, types]
    );

    const getPlaceDetails = useCallback(
      async (placeId: string): Promise<any> => {
        if (!isGoogleLoaded || !window.google?.maps?.places) {
          return null;
        }

        try {
          return new Promise((resolve) => {
            // Double-check that PlacesService is available
            if (!window.google.maps.places.PlacesService) {
              console.warn("PlacesService not available");
              resolve(null);
              return;
            }

            // Create a hidden div for the PlacesService
            const mapDiv = document.createElement("div");
            const service = new window.google.maps.places.PlacesService(mapDiv);

            service.getDetails(
              {
                placeId: placeId,
              },
              (place, status) => {
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK
                ) {
                  resolve(place);
                } else {
                  console.warn("Place details API error:", status);
                  resolve(null);
                }
              }
            );
          });
        } catch (error) {
          console.error("Error in getPlaceDetails:", error);
          return null;
        }
      },
      [isGoogleLoaded]
    );

    const parseAddressComponents = (addressComponents: any[]) => {
      let city = "";
      let country = "";
      let postalCode = "";

      addressComponents.forEach((component) => {
        if (
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_2")
        ) {
          city = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.long_name;
        }
        if (component.types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      });

      return { city, country, postalCode };
    };

    const handlePlaceSelect = useCallback(
      async (prediction: GooglePlacesPrediction) => {
        const details = await getPlaceDetails(prediction.place_id);

        if (details) {
          const { city, country, postalCode } = parseAddressComponents(
            details.address_components || []
          );

          const locationData: LocationData = {
            latitude: details.geometry.location.lat(),
            longitude: details.geometry.location.lng(),
            address: details.formatted_address,
            city,
            country,
            postalCode,
            placeId: details.place_id,
          };

          setQuery(prediction.description);
          setShowSuggestions(false);
          setPredictions([]);
          onDropdownVisibilityChange?.(false);
          onInputFocusChange?.(false);
          onLocationSelected(locationData);
        }
      },
      [getPlaceDetails, onLocationSelected]
    );

    const handleQueryChange = useCallback(
      (text: string) => {
        setQuery(text);

        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = window.setTimeout(() => {
          searchPlaces(text);
        }, debounce);
      },
      [searchPlaces, debounce]
    );

    const highlightText = (text: string, searchQuery: string) => {
      if (!searchQuery.trim())
        return <Text className="text-foreground text-sm">{text}</Text>;

      const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
      return (
        <Text className="text-foreground text-sm">
          {parts.map((part, index) => {
            const isMatch = part.toLowerCase() === searchQuery.toLowerCase();
            return (
              <Text
                key={index}
                style={{
                  color: isMatch ? "#059669" : resolvedColors?.foreground,
                  fontWeight: isMatch ? "600" : "400",
                  fontSize: 14,
                }}
              >
                {part}
              </Text>
            );
          })}
        </Text>
      );
    };

    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not configured");
      return (
        <View className={cn("flex-1", className)}>
          <Text className="text-red-500 text-sm p-2">
            Google Maps API key not configured
          </Text>
        </View>
      );
    }

    if (!isGoogleLoaded) {
      return (
        <View className={cn("flex-1", className)}>
          <Text className="text-gray-500 text-sm p-2">
            Loading Google Maps...
          </Text>
        </View>
      );
    }

    return (
      <View className={cn("flex-1 relative", className)}>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={handleQueryChange}
          placeholder={placeholder}
          placeholderTextColor={resolvedColors?.mutedForeground}
          editable={!disabled}
          style={{
            height: 24,
            color: resolvedColors?.foreground,
            fontSize: 16,
            backgroundColor: "transparent",
            borderWidth: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
          }}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowSuggestions(true);
            }
            onDropdownVisibilityChange?.(true);
            onInputFocusChange?.(true);
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow for selection
            setTimeout(() => {
              setShowSuggestions(false);
              onDropdownVisibilityChange?.(false);
              onInputFocusChange?.(false);
            }, 150);
          }}
        />

        {showSuggestions && predictions.length > 0 && (
          <View
            style={{
              position: "absolute",
              top: 36,
              left: -32,
              right: -46,
              backgroundColor: resolvedColors?.background,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: resolvedColors?.border,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              maxHeight: 320,
              zIndex: 1000,
              width: "100%",
            }}
          >
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handlePlaceSelect(item)}
                  style={{
                    backgroundColor: resolvedColors?.background,
                    padding: 16,
                    minHeight: 56,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    borderBottomWidth: 0.5,
                    borderBottomColor: resolvedColors?.border,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    {highlightText(item.description, query)}
                    {item.structured_formatting?.secondary_text && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: resolvedColors?.mutedForeground,
                          marginTop: 4,
                          lineHeight: 16,
                        }}
                      >
                        {item.structured_formatting.secondary_text}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {loading && (
          <View
            style={{
              position: "absolute",
              top: 48,
              left: 0,
              right: 0,
              backgroundColor: resolvedColors?.background,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: resolvedColors?.border,
              padding: 16,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Text className="text-foreground text-sm">Searching...</Text>
          </View>
        )}
      </View>
    );
  }
);

// Main component with platform detection
const GooglePlacesAutocompleteComponentInternal = forwardRef<
  GooglePlacesAutocompleteHandle,
  GooglePlacesAutocompleteProps
>((props, ref) => {
  if (Platform.OS === "web") {
    return <WebGooglePlacesAutocomplete {...props} ref={ref} />;
  } else {
    return <NativeGooglePlacesAutocomplete {...props} ref={ref} />;
  }
});

export const GooglePlacesAutocompleteComponent = React.memo(
  GooglePlacesAutocompleteComponentInternal
);

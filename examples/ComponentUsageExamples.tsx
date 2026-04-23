import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  LocationPicker,
  type LocationData,
} from "@/components/ui/location-picker";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

/**
 * Examples showing how to use the ImageUploader and LocationPicker components
 */
export function ComponentUsageExamples() {
  const [profileImage, setProfileImage] = useState<string>("");
  const [businessLogo, setBusinessLogo] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<
    LocationData | undefined
  >();

  return (
    <ScrollView className="flex-1 p-6 bg-background">
      <Text className="text-2xl font-bold text-foreground mb-6">
        Component Usage Examples
      </Text>

      {/* Image Uploader Examples */}
      <View className="gap-6 mb-8">
        <Text className="text-xl font-semibold text-foreground">
          Image Uploader Component
        </Text>

        {/* Profile Picture Example */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Profile Picture
          </Text>
          <ImageUploader
            value={profileImage}
            onImageSelected={setProfileImage}
            onImageRemoved={() => setProfileImage("")}
            placeholder="Upload Profile Picture"
            aspectRatio={[1, 1]} // Square aspect ratio
            quality={0.8}
            allowsEditing={true}
          />
          {profileImage && (
            <Text className="text-sm text-muted-foreground">
              Selected:{" "}
              {profileImage.substring(profileImage.lastIndexOf("/") + 1)}
            </Text>
          )}
        </View>

        {/* Business Logo Example */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Business Logo
          </Text>
          <ImageUploader
            value={businessLogo}
            onImageSelected={setBusinessLogo}
            onImageRemoved={() => setBusinessLogo("")}
            placeholder="Upload Business Logo"
            aspectRatio={[16, 9]} // Landscape aspect ratio
            quality={0.9}
            allowsEditing={true}
            className="h-24" // Custom height
          />
          {businessLogo && (
            <Text className="text-sm text-muted-foreground">
              Logo selected:{" "}
              {businessLogo.substring(businessLogo.lastIndexOf("/") + 1)}
            </Text>
          )}
        </View>
      </View>

      {/* Location Picker Examples */}
      <View className="gap-6">
        <Text className="text-xl font-semibold text-foreground">
          Location Picker Component
        </Text>

        {/* Business Location Example */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Business Location
          </Text>
          <LocationPicker
            value={selectedLocation}
            onLocationSelected={setSelectedLocation}
            placeholder="Select business location"
            showCurrentLocationButton={true}
          />
          {selectedLocation && (
            <View className="bg-muted p-3 rounded-lg">
              <Text className="text-sm font-medium text-foreground mb-1">
                Selected Location:
              </Text>
              <Text className="text-sm text-muted-foreground">
                Address: {selectedLocation.address || "Custom location"}
              </Text>
              {selectedLocation.city && (
                <Text className="text-sm text-muted-foreground">
                  City: {selectedLocation.city}
                </Text>
              )}
              {selectedLocation.country && (
                <Text className="text-sm text-muted-foreground">
                  Country: {selectedLocation.country}
                </Text>
              )}
              <Text className="text-sm text-muted-foreground">
                Coordinates: {selectedLocation.latitude.toFixed(6)},{" "}
                {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Clear Location Example */}
        <Button
          variant="outline"
          onPress={() => setSelectedLocation(undefined)}
          disabled={!selectedLocation}
        >
          <Text>Clear Location</Text>
        </Button>
      </View>

      {/* Usage in Forms Example */}
      <View className="gap-6 mt-8">
        <Text className="text-xl font-semibold text-foreground">
          Usage in React Hook Form
        </Text>
        <View className="bg-muted p-4 rounded-lg">
          <Text className="text-sm font-mono text-foreground">
            {`// Image Uploader with React Hook Form
<Controller
  control={control}
  name="profileImage"
  rules={{ required: "Profile image is required" }}
  render={({ field: { onChange, value } }) => (
    <ImageUploader
      value={value}
      onImageSelected={onChange}
      onImageRemoved={() => onChange("")}
      placeholder="Upload Profile Picture"
      aspectRatio={[1, 1]}
    />
  )}
/>

// Location Picker with React Hook Form  
<Controller
  control={control}
  name="location"
  rules={{ required: "Location is required" }}
  render={({ field: { onChange, value } }) => (
    <LocationPicker
      value={value}
      onLocationSelected={onChange}
      placeholder="Select location"
    />
  )}
/>`}
          </Text>
        </View>
      </View>

      {/* Permissions Info */}
      <View className="gap-3 mt-8">
        <Text className="text-xl font-semibold text-foreground">
          Required Permissions & Platform Support
        </Text>
        <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <Text className="text-sm text-foreground font-medium mb-2">
            Image Uploader requires:
          </Text>
          <Text className="text-sm text-muted-foreground">
            • Camera permissions (for taking photos){"\n"}• Media library
            permissions (for selecting from gallery)
          </Text>

          <Text className="text-sm text-foreground font-medium mb-2 mt-4">
            Location Picker requires:
          </Text>
          <Text className="text-sm text-muted-foreground">
            • Location permissions (for current location){"\n"}• Network access
            (for geocoding and reverse geocoding)
          </Text>

          <Text className="text-sm text-foreground font-medium mb-2 mt-4">
            Platform Support:
          </Text>
          <Text className="text-sm text-muted-foreground">
            • iOS/Android: Uses expo-maps (preferred) or react-native-maps
            (fallback){"\n"}• Web: Uses @teovilla/react-native-web-maps
            (preferred) or react-native-maps (fallback){"\n"}• Automatic
            fallback when map libraries are unavailable
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

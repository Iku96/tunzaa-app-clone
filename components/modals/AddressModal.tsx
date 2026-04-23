import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { MapPin, ChevronRight, MapPinned } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Terminal } from "@/lib/icons/Terminal";
import { Textarea } from "../ui/textarea";
import { LocationPicker, LocationData } from "@/components/ui/location-picker";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

// Updated interface to match API requirements
interface Address {
  address_id?: string;
  title: string;
  land_mark: string;
  address_line1: string;
  city: string;
  state_province: string;
  country: string;
  lat?: string;
  lng?: string;
  isDefault?: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  address?: Address;
  onClose: () => void;
  onSubmit: (address: Address) => void;
}

export function AddressModal({
  isOpen,
  address,
  onClose,
  onSubmit,
}: AddressModalProps) {
  const { t } = useI18n();
  const isEditMode = !!address;
  
  // Step 1: Location Selection, Step 2: Form Details
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | undefined>(undefined);
  const [formData, setFormData] = useState<Address>({
    title: "",
    land_mark: "",
    address_line1: "",
    city: "",
    state_province: "",
    country: "Tanzania",
    isDefault: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedColors = useResolvedThemeColors();
  
  // Initialize form data when editing an existing address
  useEffect(() => {
    if (address) {
      setFormData({
        ...address,
        isDefault: address.isDefault || false,
      });
      
      // If editing existing address, set the location and go directly to form
      if (address.lat && address.lng) {
        setSelectedLocation({
          latitude: parseFloat(address.lat),
          longitude: parseFloat(address.lng),
          address: address.address_line1,
          city: address.city,
          country: address.country,
        });
        setCurrentStep(2); // Skip to form step when editing
      }
    } else {
      // Reset to step 1 when creating new address
      setCurrentStep(1);
      setSelectedLocation(undefined);
      setFormData({
        title: "",
        land_mark: "",
        address_line1: "",
        city: "",
        state_province: "",
        country: "Tanzania",
        isDefault: false,
      });
    }
  }, [address, isOpen]);

  const handleLocationSelected = (location: LocationData) => {
    setSelectedLocation(location);
    
    // Auto-populate form fields from location data
    setFormData(prev => ({
      ...prev,
      address_line1: location.address || "",
      city: location.city || "",
      country: location.country || "Tanzania",
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.address_line1 ||
      !formData.city ||
      !formData.land_mark ||
      !selectedLocation
    ) {
      setError("Please fill in all required fields and select a location");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const addressData: Address = {
        ...formData,
        lat: selectedLocation.latitude.toString(),
        lng: selectedLocation.longitude.toString(),
      };
      
      await onSubmit(addressData);
    } catch (error) {
      setError("Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLocationStep = () => (
    <View className="flex-1 justify-center items-center px-4">
      {/* Header with Icon */}
      <View className="items-center mb-8">
        <View className="bg-primary/10 p-6 rounded-full mb-4">
          <MapPinned size={48} className="text-primary" color={resolvedColors?.primary} />
        </View>
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          {t("address.select_location_title")}
        </Text>
        <Text className="text-base text-muted-foreground text-center max-w-md">
          {t("address.select_location_description")}
        </Text>
      </View>

      {/* Location Picker - Prominent */}
      <View className="w-full mb-6">
        <LocationPicker
          value={selectedLocation}
          onLocationSelected={handleLocationSelected}
          placeholder={t("address.tap_to_select_location")}
          showCurrentLocationButton={true}
        />
      </View>

      {/* Selected Location Preview */}
      {selectedLocation && (
        <View className="w-full p-4 bg-primary/5 border-2 border-primary rounded-xl mb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <MapPin size={20} className="text-primary" color={resolvedColors?.primary} />
            <Text className="text-base font-semibold text-primary">
              {t("address.location_selected")}
            </Text>
          </View>
          <Text className="text-sm font-medium text-foreground mb-1">
            {selectedLocation.address || "Selected Location"}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {selectedLocation.city && `${selectedLocation.city}, `}
            {selectedLocation.country}
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View className="w-full p-4 bg-muted/30 rounded-lg">
        <Text className="text-sm text-muted-foreground text-center">
          💡 {t("address.location_tip")}
        </Text>
      </View>
    </View>
  );

  const renderFormStep = () => (
    <ScrollView 
      className="flex-1" 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="pb-4">
        {error && (
          <Alert icon={Terminal} variant="destructive" className="mb-4">
            <Text className="text-sm text-destructive">{error}</Text>
          </Alert>
        )}

        {/* Show selected location at top */}
        <View className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
          <View className="flex-row items-start gap-3">
            <MapPin size={20} className="text-primary mt-1" color={resolvedColors?.primary} />
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground mb-1">
                {t("address.delivery_location")}
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {selectedLocation?.address || "Selected Location"}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                {selectedLocation?.city && `${selectedLocation.city}, `}
                {selectedLocation?.country}
              </Text>
            </View>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onPress={() => setCurrentStep(1)}
            >
              <Text className="text-xs text-primary">{t("common.change")}</Text>
            </Button>
          </View>
        </View>

        {/* Form Fields */}
        <View>
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">
                Address Title <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="e.g., Home, Work, Office"
                editable={!isLoading}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">
                Street Address <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.address_line1}
                onChangeText={(text) => setFormData({ ...formData, address_line1: text })}
                placeholder="Street address"
                editable={!isLoading}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2">
                  City <Text className="text-destructive">*</Text>
                </Text>
                <Input
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="City"
                  editable={!isLoading}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2">State/Province</Text>
                <Input
                  value={formData.state_province}
                  onChangeText={(text) => setFormData({ ...formData, state_province: text })}
                  placeholder="State/Province"
                  editable={!isLoading}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">
                Country <Text className="text-destructive">*</Text>
              </Text>
              <Input
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                placeholder="Country"
                editable={!isLoading}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">
                Landmarks/Directions <Text className="text-destructive">*</Text>
              </Text>
              <Textarea
                value={formData.land_mark}
                onChangeText={(text) => setFormData({ ...formData, land_mark: text })}
                placeholder="Add landmarks or specific directions to help find this location (e.g., 'Near ABC supermarket, white gate')"
                multiline
                className="min-h-[120px] py-2"
                textAlignVertical="top"
                editable={!isLoading}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

        <View className="flex-row items-center mb-6">
          <Checkbox
            checked={formData.isDefault}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isDefault: checked as boolean })
            }
            disabled={isLoading}
          />
          <Text className="ml-2 text-sm">{t("address.set_as_default")}</Text>
        </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    // Only use KeyboardAvoidingView on iOS - Android bottom sheets handle keyboard natively
    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView 
          behavior="padding"
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          {currentStep === 1 ? renderLocationStep() : renderFormStep()}
        </KeyboardAvoidingView>
      );
    }

    // Android: No KeyboardAvoidingView to prevent flickering
    return (
      <View className="flex-1">
        {currentStep === 1 ? renderLocationStep() : renderFormStep()}
      </View>
    );
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      // Step 1: Location Selection Footer
      return (
        <View className="flex-row gap-x-3">
          <Button
            variant="outline"
            onPress={onClose}
            className="flex-1"
          >
            <Text className="font-semibold text-foreground">{t("common.cancel")}</Text>
          </Button>

          <Button
            variant="primary"
            disabled={!selectedLocation}
            onPress={() => setCurrentStep(2)}
            className="flex-1 flex-row items-center justify-center gap-2"
          >
            <Text className="text-primary-foreground font-semibold">
              {t("common.continue")}
            </Text>
            <ChevronRight size={18} color={resolvedColors?.primaryForeground} />
          </Button>
        </View>
      );
    }

    // Step 2: Form Footer
    return (
      <View className="flex-row gap-x-3">
        <Button
          variant="outline"
          onPress={() => setCurrentStep(1)}
          disabled={isLoading}
          className="flex-1"
        >
          <Text className="font-semibold text-foreground">{t("common.back")}</Text>
        </Button>

        <Button
          variant="primary"
          disabled={
            !formData.title ||
            !formData.address_line1 ||
            !formData.city ||
            !formData.land_mark ||
            !selectedLocation ||
            isLoading
          }
          onPress={handleSubmit}
          className="flex-1"
        >
          <Text className="text-primary-foreground font-semibold">
            {isLoading ? t("common.saving") : t("address.save_address")}
          </Text>
        </Button>
      </View>
    );
  };

  const getModalTitle = () => {
    if (isEditMode) {
      return currentStep === 1 
        ? t("address.change_location")
        : t("address.edit_address");
    }
    return currentStep === 1
      ? t("address.select_location")
      : t("address.add_delivery_address");
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title={getModalTitle()}
      snapPoints={["90%"]}
      footer={renderFooter()}
    >
      {renderContent()}
    </ResponsiveModal>
  );
}

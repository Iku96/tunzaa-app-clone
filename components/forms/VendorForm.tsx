import React from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  LocationPicker,
  type LocationData,
} from "@/components/ui/location-picker";
import { PhoneInput } from "@/components/PhoneInput";
import { useCategoryNames } from "@/hooks/useCategories";

export interface VendorFormData {
  businessName: string;
  businessLogo: string;
  address: string;
  location?: LocationData;
  category: string;
  contactDetails: string;
  countryCode?: string;
}

interface VendorFormProps {
  onSubmit: (data: VendorFormData) => void;
  isLoading: boolean;
}

export function VendorForm({ onSubmit, isLoading }: VendorFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VendorFormData>({
    defaultValues: {
      businessName: "",
      businessLogo: "",
      address: "",
      location: undefined,
      category: "",
      contactDetails: "",
      countryCode: "+255",
    },
  });

  const selectedCategory = watch("category");
  const [selectedCountry, setSelectedCountry] = React.useState({
    name: "Tanzania",
    code: "+255",
    flag: "🇹🇿",
  });

  // Fetch categories from API
  const {
    categoryNames,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoryNames();

  return (
    <View className="gap-6">
      {/* Business Information Section */}
      <View className="gap-6">
        <Text className="text-lg font-semibold text-foreground">
          Business Information
        </Text>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Business Name<Text className="text-destructive">*</Text>
          </Text>
          <Controller
            control={control}
            name="businessName"
            rules={{ required: "Business name is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter your business name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
                className={errors.businessName ? "border-destructive" : ""}
              />
            )}
          />
          {errors.businessName && (
            <Text className="text-sm text-destructive">
              {errors.businessName.message}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Business Logo<Text className="text-destructive">*</Text>
          </Text>
          <Controller
            control={control}
            name="businessLogo"
            // rules={{ required: "Business logo is required" }}
            render={({ field: { onChange, value } }) => (
              <ImageUploader
                value={value}
                onImageSelected={onChange}
                onImageRemoved={() => onChange("")}
                placeholder="Upload Business Logo"
                disabled={isLoading}
                aspectRatio={[1, 1]}
              />
            )}
          />
          {errors.businessLogo && (
            <Text className="text-sm text-destructive">
              {errors.businessLogo.message}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Business Location<Text className="text-destructive">*</Text>
          </Text>
          <Controller
            control={control}
            name="location"
            rules={{ required: "Business location is required" }}
            render={({ field: { onChange, value } }) => (
              <LocationPicker
                value={value}
                onLocationSelected={(location) => {
                  onChange(location);
                  // Also set the address field for backwards compatibility
                  setValue(
                    "address",
                    location.address ||
                      `${location.latitude}, ${location.longitude}`
                  );
                }}
                placeholder="Select business location"
                disabled={isLoading}
              />
            )}
          />
          {errors.location && (
            <Text className="text-sm text-destructive">
              {errors.location.message}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Address Details
          </Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Additional address details (building, floor, etc.)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
                multiline
                numberOfLines={2}
              />
            )}
          />
          <Text className="text-xs text-muted-foreground">
            Add any additional details like building name, floor number, etc.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Store Category<Text className="text-destructive">*</Text>
          </Text>

          {categoriesLoading ? (
            <View className="flex-row items-center justify-center py-4">
              <ActivityIndicator size="small" />
              <Text className="ml-2 text-muted-foreground">
                Loading categories...
              </Text>
            </View>
          ) : categoriesError ? (
            <View className="p-4 bg-destructive/10 rounded-md">
              <Text className="text-sm text-destructive">
                Failed to load categories. Please try again.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-y-2"
            >
              {categoryNames.map((category: string) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "primary" : "outline"
                  }
                  size="sm"
                  className="mr-2"
                  onPress={() => setValue("category", category)}
                  disabled={isLoading || categoriesLoading}
                >
                  <Text
                    className={
                      selectedCategory === category
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }
                  >
                    {category}
                  </Text>
                </Button>
              ))}
            </ScrollView>
          )}

          <Controller
            control={control}
            name="category"
            rules={{ required: "Please select a category" }}
            render={({ field }) => <View style={{ height: 0 }} />}
          />
          {errors.category && (
            <Text className="text-sm text-destructive">
              {errors.category.message}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Controller
            control={control}
            name="contactDetails"
            rules={{
              required: "Contact phone number is required",
              pattern: {
                value: /^[\d\s-()]+$/,
                message: "Please enter a valid phone number",
              },
              minLength: {
                value: 9,
                message: "Phone number must be at least 9 digits",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setValue("countryCode", selectedCountry.code);
                }}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                label="Contact Phone Number"
                required
                editable={!isLoading}
              />
            )}
          />
          {errors.contactDetails && (
            <Text className="text-sm text-destructive">
              {errors.contactDetails.message}
            </Text>
          )}
        </View>
      </View>

      <Button
        variant="default"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        className="w-full"
      >
        <Text className="text-primary font-semibold">
          {isLoading ? "Creating Profile..." : "Complete Profile"}
        </Text>
      </Button>
    </View>
  );
}

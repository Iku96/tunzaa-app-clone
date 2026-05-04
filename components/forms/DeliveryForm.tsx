import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Plus } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  LocationPicker,
  type LocationData,
} from "@/components/ui/location-picker";
import { useGetVehicleTypes } from "@/src/services/configuration";
import { API_CONFIG } from "@/src/services/config";
import { Textarea } from "../ui/textarea";

export interface Driver {
  name: string;
  phone: string;
  vehicleTypeId: string;
  vehicleDetails: string;
  location?: LocationData;
  locationDescription?: string;
  radiusKm: number;
}

export interface DeliveryFormData {
  formType: "business" | "individual" | "wakala";
  businessName?: string;
  businessLogo?: string;
  contactDetails?: string;
  profilePicture?: string;
  selectedVehicleId?: string;
  vehicleDetails?: string;
  radiusKm?: number;
  location?: LocationData;
  locationDescription?: string;
  drivers?: Driver[];
}

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => void;
  isLoading: boolean;
}

export function DeliveryForm({ onSubmit, isLoading }: DeliveryFormProps) {
  const { data: vehicleTypesData, isLoading: vehicleTypesLoading } =
    useGetVehicleTypes({
      tenant_id: API_CONFIG.TENANT_ID,
      skip: 0,
      limit: 100,
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DeliveryFormData>({
    defaultValues: {
      formType: "individual",
      businessName: "",
      businessLogo: "",
      contactDetails: "",
      profilePicture: "",
      selectedVehicleId: "",
      vehicleDetails: "",
      radiusKm: 10,
      location: undefined,
      locationDescription: "",
      drivers: [
        {
          name: "",
          phone: "",
          vehicleTypeId: "",
          vehicleDetails: "",
          location: undefined,
          locationDescription: "",
          radiusKm: 10,
        },
      ],
    },
  });

  const {
    fields: drivers,
    append: appendDriver,
    remove: removeDriver,
  } = useFieldArray({
    control,
    name: "drivers",
  });

  const formType = watch("formType");

  const addDriver = () => {
    appendDriver({
      name: "",
      phone: "",
      vehicleTypeId: "",
      vehicleDetails: "",
      location: undefined,
      locationDescription: "",
      radiusKm: 10,
    });
  };

  const vehicleTypes = vehicleTypesData?.items || [];

  const renderVehicleSelection = (
    onSelect: (vehicleId: string) => void,
    selected: string,
    disabled = false
  ) => {


    if (vehicleTypesLoading) {
      return (
        <View className="flex-row flex-wrap gap-2">
          <Text className="text-muted-foreground">
            Loading vehicle types...
          </Text>
        </View>
      );
    }

    if (!vehicleTypes || vehicleTypes.length === 0) {
      return (
        <View className="py-4 px-2 bg-muted rounded-lg">
          <Text className="text-center text-muted-foreground">
            No vehicle types available
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap gap-2">
        {vehicleTypes.map((vehicle: any) => {
          const vehicleId = vehicle.vehicle_id; // Use vehicle_id instead of _id
          const isSelected = selected === vehicleId;

          return (
            <TouchableOpacity
              key={vehicleId}
              onPress={() => {
                onSelect(vehicleId);
              }}
              disabled={disabled || vehicleTypesLoading}
              activeOpacity={0.7}
              className={`w-20 h-20 rounded-lg border justify-center items-center ${isSelected
                  ? "bg-primary border-primary"
                  : "bg-muted border-border"
                }`}
            >
              {/* {vehicle.icon_url ? (
                <Image
                  source={{ uri: vehicle.icon_url }}
                  className="w-8 h-8 rounded mb-1"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-8 h-8 bg-gray-300 rounded mb-1" />
              )} */}
              <Text
                className={`text-xs font-medium text-center ${isSelected ? "text-primary" : "text-foreground"
                  }`}
                numberOfLines={1}
              >
                {vehicle.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View className="gap-6">
      {/* Form Type Selector */}
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Delivery Partner Type
        </Text>
        <View className="flex-row bg-muted rounded-lg p-1">
          {(["individual"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setValue("formType", type)}
              className={`flex-1 py-3 px-4 rounded-md ${formType === type ? "bg-background shadow-sm" : ""
                }`}
            >
              <Text
                className={`text-center text-sm font-medium ${formType === type
                    ? "text-foreground"
                    : "text-muted-foreground"
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Form Type Specific Sections */}
      {formType === "individual" && (
        <View className="gap-6">
          <Text className="text-lg font-semibold text-foreground">
            Individual Details
          </Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Profile Picture<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="profilePicture"
              rules={{ required: "Profile picture is required" }}
              render={({ field: { onChange, value } }) => (
                <ImageUploader
                  value={value}
                  onImageSelected={onChange}
                  onImageRemoved={() => onChange("")}
                  placeholder="Upload Profile Picture"
                  disabled={isLoading}
                  aspectRatio={[1, 1]}
                />
              )}
            />
            {errors.profilePicture && (
              <Text className="text-sm text-destructive">
                {errors.profilePicture.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Vehicle Type<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="selectedVehicleId"
              rules={{ required: "Please select a vehicle type" }}
              render={({ field: { onChange, value } }) =>
                renderVehicleSelection(onChange, value || "", isLoading)
              }
            />
            {errors.selectedVehicleId && (
              <Text className="text-sm text-destructive">
                {errors.selectedVehicleId.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Vehicle Details<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="vehicleDetails"
              rules={{ required: "Vehicle details are required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="e.g., Honda CB150R, Red, T123ABC"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                  className={
                    errors.vehicleDetails ? "border-destructive" : ""
                  }
                />
              )}
            />
            {errors.vehicleDetails && (
              <Text className="text-sm text-destructive">
                {errors.vehicleDetails.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Delivery Radius (km)<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="radiusKm"
              rules={{
                required: "Delivery radius is required",
                min: { value: 1, message: "Radius must be at least 1 km" },
                max: { value: 500, message: "Radius cannot exceed 500 km" },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="How far are you willing to deliver? (in km)"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  value={value?.toString() || ""}
                  keyboardType="numeric"
                  editable={!isLoading}
                  className={errors.radiusKm ? "border-destructive" : ""}
                />
              )}
            />
            {errors.radiusKm && (
              <Text className="text-sm text-destructive">
                {errors.radiusKm.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Location<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field: { onChange, value } }) => (
                <LocationPicker
                  value={value}
                  onLocationSelected={onChange}
                  placeholder="Select your location"
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
              Location Description
            </Text>
            <Controller
              control={control}
              name="locationDescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Describe your location (e.g., near main road, behind shopping mall)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                />
              )}
            />
          </View>
        </View>
      )}

      {formType === "business" && (
        <View className="gap-6">
          <Text className="text-lg font-semibold text-foreground">
            Business Details
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
              rules={{ required: "Business logo is required" }}
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
              Contact Details<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="contactDetails"
              rules={{
                required: "Contact details are required",
                pattern: {
                  value: /^[+]?[\d\s-()]+$/,
                  message: "Please enter a valid phone number",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter contact phone number"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  className={
                    errors.contactDetails ? "border-destructive" : ""
                  }
                />
              )}
            />
            {errors.contactDetails && (
              <Text className="text-sm text-destructive">
                {errors.contactDetails.message}
              </Text>
            )}
          </View>

          {/* Drivers Section */}
          <View className="gap-4">
            <Text className="text-sm font-semibold text-foreground">
              Drivers<Text className="text-destructive">*</Text>
            </Text>

            {drivers.map((driver, index) => (
              <View key={driver.id} className="bg-muted rounded-lg p-4 gap-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-semibold text-foreground">
                    Driver {index + 1}
                  </Text>
                  {drivers.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onPress={() => removeDriver(index)}
                    >
                      <Text className="text-destructive-foreground">
                        Remove
                      </Text>
                    </Button>
                  )}
                </View>

                <Controller
                  control={control}
                  name={`drivers.${index}.name`}
                  rules={{ required: "Driver name is required" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Driver's name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isLoading}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`drivers.${index}.phone`}
                  rules={{ required: "Driver phone is required" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Driver's phone number"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`drivers.${index}.vehicleTypeId`}
                  rules={{ required: "Vehicle type is required" }}
                  render={({ field: { onChange, value } }) =>
                    renderVehicleSelection(onChange, value || "", isLoading)
                  }
                />

                <Controller
                  control={control}
                  name={`drivers.${index}.vehicleDetails`}
                  rules={{ required: "Vehicle details are required" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="e.g., Honda CB150R, Red, T123ABC"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isLoading}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`drivers.${index}.radiusKm`}
                  rules={{
                    required: "Delivery radius is required",
                    min: {
                      value: 1,
                      message: "Radius must be at least 1 km",
                    },
                    max: {
                      value: 500,
                      message: "Radius cannot exceed 500 km",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Delivery radius (km)"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(parseInt(text) || 0)}
                      value={value?.toString() || ""}
                      keyboardType="numeric"
                      editable={!isLoading}
                    />
                  )}
                />

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Driver Location<Text className="text-destructive">*</Text>
                  </Text>
                  <Controller
                    control={control}
                    name={`drivers.${index}.location`}
                    rules={{ required: "Driver location is required" }}
                    render={({ field: { onChange, value } }) => (
                      <LocationPicker
                        value={value}
                        onLocationSelected={onChange}
                        placeholder="Select driver's location"
                        disabled={isLoading}
                      />
                    )}
                  />
                </View>

                <Controller
                  control={control}
                  name={`drivers.${index}.locationDescription`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Describe driver's location"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline
                      numberOfLines={3}
                      editable={!isLoading}
                    />
                  )}
                />
              </View>
            ))}

            <Button
              variant="outline"
              onPress={addDriver}
              disabled={isLoading}
              className="flex-row items-center justify-center gap-2"
            >
              <Plus size={20} className="text-primary" />
              <Text className="text-primary font-medium">
                Add Another Driver
              </Text>
            </Button>
          </View>
        </View>
      )}

      {formType === "wakala" && (
        <View className="gap-6">
          <Text className="text-lg font-semibold text-foreground">
            Wakala Details
          </Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Wakala Business Name<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="businessName"
              rules={{ required: "Wakala business name is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your wakala business name"
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
              Profile Picture<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="profilePicture"
              rules={{ required: "Profile picture is required" }}
              render={({ field: { onChange, value } }) => (
                <ImageUploader
                  value={value}
                  onImageSelected={onChange}
                  onImageRemoved={() => onChange("")}
                  placeholder="Upload Profile Picture"
                  disabled={isLoading}
                  aspectRatio={[1, 1]}
                />
              )}
            />
            {errors.profilePicture && (
              <Text className="text-sm text-destructive">
                {errors.profilePicture.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Location<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field: { onChange, value } }) => (
                <LocationPicker
                  value={value}
                  onLocationSelected={onChange}
                  placeholder="Select your location"
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
              Location Description
            </Text>
            <Controller
              control={control}
              name="locationDescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Describe your location (e.g., near main road, behind shopping mall)"
                  value={value}
                  editable={!isLoading}
                  aria-labelledby="textareaLabel"
                  className={
                    errors.locationDescription ? "border-destructive" : ""
                  }
                />
              )}
            />
          </View>
        </View>
      )}

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

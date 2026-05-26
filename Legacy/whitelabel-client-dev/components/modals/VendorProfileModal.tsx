import { useState, useEffect } from "react";
import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import {
  LocationPicker,
  type LocationData,
} from "@/components/ui/location-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth";
import { useUpdateVendor } from "@/services/vendors";
import { UpdateVendorBody } from "@/services/vendors";
import * as Location from "expo-location";
import { useI18n } from "@/hooks/useI18n";

// Tanzanian Banks List
const TANZANIAN_BANKS = [
  "CRDB Bank",
  "NMB Bank",
  "Stanbic Bank Tanzania",
  "Standard Chartered Bank Tanzania",
  "Exim Bank Tanzania",
  "Bank of Africa Tanzania",
  "Azania Bank",
  "DTB Bank Tanzania",
  "Access Bank Tanzania",
  "Ecobank Tanzania",
  "Diamond Trust Bank Tanzania",
  "I&M Bank Tanzania",
  "KCB Bank Tanzania",
  "NBC Bank",
  "PBZ Bank",
  "TPB Bank",
  "FINCA Microfinance Bank",
  "Mkombozi Bank",
  "Amana Bank",
  "Rafiki Microfinance Bank",
];

interface VendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VendorFormData {
  business_name: string;
  display_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  tax_id: string;
  policy: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  swift_code: string;
  branch_code: string;
  location?: LocationData;
}

export function VendorProfileModal({
  isOpen,
  onClose,
}: VendorProfileModalProps) {
  const { t } = useI18n();
  const { user, getVendorDetails } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const updateVendorMutation = useUpdateVendor();

  const vendorDetails = getVendorDetails();
  const vendorId = user?.profiles.find((p) => p.role === "vendor")?.profile_id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VendorFormData>({
    defaultValues: {
      business_name: "",
      display_name: "",
      contact_email: "",
      contact_phone: "",
      website: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "Tanzania",
      tax_id: "",
      policy: "",
      bank_name: "",
      account_number: "",
      account_name: "",
      swift_code: "",
      branch_code: "",
    },
  });

  // Load vendor data when modal opens
  useEffect(() => {
    if (isOpen && vendorDetails) {
      reset({
        business_name: vendorDetails.business_name || "",
        display_name: vendorDetails.display_name || "",
        contact_email: vendorDetails.contact_email || "",
        contact_phone: vendorDetails.contact_phone || "",
        website: vendorDetails.website || "",
        address_line1: vendorDetails.address_line1 || "",
        address_line2: vendorDetails.address_line2 || "",
        city: vendorDetails.city || "",
        state_province: vendorDetails.state_province || "",
        postal_code: vendorDetails.postal_code || "",
        country: vendorDetails.country || "Tanzania",
        tax_id: vendorDetails.tax_id || "",
        policy: vendorDetails.policy || "",
        bank_name: vendorDetails.bank_account?.bank_name || "",
        account_number: vendorDetails.bank_account?.account_number || "",
        account_name: vendorDetails.bank_account?.account_name || "",
        swift_code: vendorDetails.bank_account?.swift_code || "",
        branch_code: vendorDetails.bank_account?.branch_code || "",
      });
    }
  }, [isOpen, vendorDetails, reset]);

  const handleLocationSelected = async (location: LocationData) => {
    setValue("location", location);

    // Auto-populate address fields from location
    if (location.address) {
      setValue("address_line1", location.address);
    }
    if (location.city) {
      setValue("city", location.city);
      setValue("state_province", location.city); // In Tanzania, often city = state
    }
    if (location.country) {
      setValue("country", location.country);
    }
    if (location.postalCode) {
      setValue("postal_code", location.postalCode);
    }
  };

  const onSubmit = async (data: VendorFormData) => {
    if (!vendorId) {
      Alert.alert(t("common.error"), t("vendor.profile.no_profile_data"));
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UpdateVendorBody = {
        business_name: data.business_name,
        display_name: data.display_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        website: data.website,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state_province: data.state_province,
        postal_code: data.postal_code,
        country: data.country,
        tax_id: data.tax_id,
        policy: data.policy,
        bank_account: {
          bank_name: data.bank_name,
          account_number: data.account_number,
          account_name: data.account_name,
          swift_code: data.swift_code,
          branch_code: data.branch_code,
        },
        // Keep existing verification documents
        verification_documents: vendorDetails?.verification_documents || [],
      };

      await updateVendorMutation.mutateAsync({
        vendorId,
        data: updateData,
      });

      Alert.alert(t("common.success"), t("common.success"));
      onClose();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={t("vendor.profile.update_profile")}
    >
      <ScrollView className="flex-1 p-6">
        <View className="gap-6">
          {/* Business Information */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              {t("vendor.profile.business_information")}
            </Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.business_name")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="business_name"
                rules={{ required: t("vendor.profile.business_name_required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_business_name")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className={errors.business_name ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.business_name && (
                <Text className="text-sm text-destructive">
                  {errors.business_name.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.display_name")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="display_name"
                rules={{ required: t("vendor.profile.display_name_required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_display_name")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className={errors.display_name ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.display_name && (
                <Text className="text-sm text-destructive">
                  {errors.display_name.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.contact_email")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="contact_email"
                rules={{
                  required: t("vendor.profile.contact_email_required"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t("vendor.profile.valid_email_required"),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_contact_email")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    className={errors.contact_email ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.contact_email && (
                <Text className="text-sm text-destructive">
                  {errors.contact_email.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.contact_phone")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="contact_phone"
                rules={{ required: t("vendor.profile.contact_phone_required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_contact_phone")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    className={errors.contact_phone ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.contact_phone && (
                <Text className="text-sm text-destructive">
                  {errors.contact_phone.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.website")}
              </Text>
              <Controller
                control={control}
                name="website"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_website_url")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="url"
                  />
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.policy_url")}
              </Text>
              <Controller
                control={control}
                name="policy"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_policy_url")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="url"
                  />
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.tax_id")}
              </Text>
              <Controller
                control={control}
                name="tax_id"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_tax_id")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          {/* Address Information */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              {t("vendor.profile.address_information")}
            </Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.business_location")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="location"
                rules={{ required: t("vendor.profile.business_location_required") }}
                render={({ field: { value } }) => (
                  <LocationPicker
                    value={value}
                    onLocationSelected={handleLocationSelected}
                    placeholder={t("vendor.profile.select_business_location")}
                  />
                )}
              />
              {errors.location && (
                <Text className="text-sm text-destructive">
                  {t("vendor.profile.business_location_required")}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.address_line1")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="address_line1"
                rules={{ required: t("vendor.profile.address_line1_required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_address_line1")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className={errors.address_line1 ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.address_line1 && (
                <Text className="text-sm text-destructive">
                  {errors.address_line1.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.address_line2")}
              </Text>
              <Controller
                control={control}
                name="address_line2"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_address_line2")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("vendor.profile.city")}<Text className="text-destructive">*</Text>
                </Text>
                <Controller
                  control={control}
                  name="city"
                  rules={{ required: t("vendor.profile.city_required") }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("vendor.profile.enter_city")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={errors.city ? "border-destructive" : ""}
                    />
                  )}
                />
                {errors.city && (
                  <Text className="text-sm text-destructive">
                    {errors.city.message}
                  </Text>
                )}
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("vendor.profile.state_province")}<Text className="text-destructive">*</Text>
                </Text>
                <Controller
                  control={control}
                  name="state_province"
                  rules={{ required: t("vendor.profile.state_province_required") }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("vendor.profile.enter_state_province")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={
                        errors.state_province ? "border-destructive" : ""
                      }
                    />
                  )}
                />
                {errors.state_province && (
                  <Text className="text-sm text-destructive">
                    {errors.state_province.message}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("vendor.profile.postal_code")}
                </Text>
                <Controller
                  control={control}
                  name="postal_code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("vendor.profile.enter_postal_code")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("vendor.profile.country")}<Text className="text-destructive">*</Text>
                </Text>
                <Controller
                  control={control}
                  name="country"
                  rules={{ required: t("vendor.profile.country_required") }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("vendor.profile.enter_country")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={errors.country ? "border-destructive" : ""}
                    />
                  )}
                />
                {errors.country && (
                  <Text className="text-sm text-destructive">
                    {errors.country.message}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Bank Information */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              {t("vendor.profile.bank_information")}
            </Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.bank_name")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="bank_name"
                rules={{ required: t("vendor.profile.bank_name_required") }}
                render={({ field: { onChange, value } }) => {
                  const selectedOption = value ? { value, label: value } : undefined;
                  
                  return (
                    <Select 
                      value={selectedOption} 
                      onValueChange={(option) => onChange(option?.value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("vendor.profile.select_bank")} />
                      </SelectTrigger>
                      <SelectContent>
                        {TANZANIAN_BANKS.map((bank) => (
                          <SelectItem key={bank} value={bank} label={bank} />
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.bank_name && (
                <Text className="text-sm text-destructive">
                  {errors.bank_name.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.account_number")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="account_number"
                rules={{ required: t("vendor.profile.account_number_required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_account_number")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                    className={
                      errors.account_number ? "border-destructive" : ""
                    }
                  />
                )}
              />
              {errors.account_number && (
                <Text className="text-sm text-destructive">
                  {errors.account_number.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("vendor.profile.account_name")}<Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="account_name"
                rules={{ required: t("vendor.profile.account_name_required") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("vendor.profile.enter_account_name")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className={errors.account_name ? "border-destructive" : ""}
                  />
                )}
              />
              {errors.account_name && (
                <Text className="text-sm text-destructive">
                  {errors.account_name.message}
                </Text>
              )}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("vendor.profile.swift_code")}
                </Text>
                <Controller
                  control={control}
                  name="swift_code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("vendor.profile.enter_swift_code")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("vendor.profile.branch_code")}
                </Text>
                <Controller
                  control={control}
                  name="branch_code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("vendor.profile.enter_branch_code")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>
          </View>

          <View className="flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onPress={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              <Text className="text-foreground">{t("common.cancel")}</Text>
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-primary-foreground font-semibold">
                  {t("vendor.profile.save_changes")}
                </Text>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </ResponsiveModal>
  );
}

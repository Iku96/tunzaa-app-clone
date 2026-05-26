import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Star,
  CreditCard as Edit2,
  Trash2,
  Edit,
} from "lucide-react-native";
import { AddressModal } from "@/components/modals/AddressModal";
import { Alert } from "@/components/ui/alert";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/Table";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import { Terminal } from "@/lib/icons/Terminal";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

export default function AddressesScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const resolvedColors = useResolvedThemeColors();
  usePageTitle(t("account.addresses"));

  // Use standardized address management
  const {
    buyerProfile,
    profileLoading,
    isSubmitting,
    error,
    setError,
    handleAddressSubmit,
    handleSetDefaultAddress,
    handleDeleteAddress,
  } = useAddressManagement({
    onSuccess: () => {
      setShowAddressModal(false);
      setSelectedAddress(null);
    },
    onError: (errorMsg) => console.error("Address operation failed:", errorMsg),
  });

  const addresses = buyerProfile?.delivery_address || [];

  const handleEdit = (address: any) => {
    setSelectedAddress(address);
    setShowAddressModal(true);
  };

  const handleDelete = async (addressId: string) => {
    await handleDeleteAddress(addressId);
  };

  const handleSetDefault = async (addressId: string) => {
    await handleSetDefaultAddress(addressId);
  };

  const handleAddressModalSubmit = async (address: any) => {
    await handleAddressSubmit(address);
  };

  // Define table columns for addresses
  const addressColumns = [
    {
      header: t("address.title"),
      accessor: "title",
      render: (value: string, address: any) => (
        <View className="flex-row items-center gap-2">
          <MapPin size={20} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
          <Text className="text-base font-semibold text-foreground">{value}</Text>
          {address.address_id === buyerProfile?.default_delivery_address && (
            <View className="flex-row items-center bg-warning/10 px-2 py-1 rounded-full gap-1">
              <Star size={12} className="text-primary" color={resolvedColors.primary} fill={resolvedColors.primary} />
              <Text className="text-xs font-semibold text-primary">{t("common.default")}</Text>
            </View>
          )}
        </View>
      ),
    },
    {
      header: t("address.address"),
      accessor: "address_line1",
      render: (value: string, address: any) => (
        <View>
          <Text className="text-sm text-foreground">{value}</Text>
          {address.address_line2 && (
            <Text className="text-sm text-muted-foreground">{address.address_line2}</Text>
          )}
          <Text className="text-sm text-muted-foreground">
            {address.city}, {address.country}
          </Text>
          {address.land_mark && (
            <Text className="text-xs text-muted-foreground">{address.land_mark}</Text>
          )}
        </View>
      ),
    },
    {
      header: t("address.actions"),
      accessor: "actions",
      render: (_: any, address: any) => (
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            className="p-2 rounded-lg"
            onPress={() => handleEdit(address)}
            disabled={isSubmitting}
          >
            <Edit size={16} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
          </Button>
          <Button
            variant="secondary"
            className="p-2 rounded-lg"
            onPress={() => handleDelete(address.address_id!)}
            disabled={isSubmitting}
          >
            <Trash2 size={16} className="text-destructive" color={resolvedColors.destructive} />
          </Button>
          {address.address_id !== buyerProfile?.default_delivery_address && (
            <Button
              variant="primary"
              className="p-2 rounded-lg"
              onPress={() => handleSetDefault(address.address_id!)}
              disabled={isSubmitting}
            >
              <Text className="text-xs text-accent-foreground">
                {isSubmitting ? t("address.setting") : t("address.set_default")}
              </Text>
            </Button>
          )}
        </View>
      ),
    },
  ];

  return (

      <SafeAreaView className="flex-1 bg-background">
          <View className="flex-1 py-0">
            <View className="mb-6 flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-foreground"></Text>
              <Button
                variant="primary"
                size="lg"
                className="flex-row items-center gap-2"
                onPress={() => setShowAddressModal(true)}
              >
                <Plus size={20} className="text-primary-foreground" color={resolvedColors.primaryForeground} />
                <Text className="text-base font-semibold text-primary-foreground">{t("address.add_new_address")}</Text>
              </Button>
            </View>
            {error && (
              <Alert icon={Terminal} variant="destructive" className="mb-4">
                <Text className="text-sm text-destructive">{error}</Text>
              </Alert>
            )}
            {profileLoading ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-muted-foreground text-lg">{t("address.loading_addresses")}</Text>
              </View>
            ) : addresses.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-muted-foreground text-lg">{t("address.no_addresses_found")}</Text>
              </View>
            ) : (
              <Table
                columns={addressColumns}
                data={addresses}
                ariaLabelledBy="addresses-table"
              />
            )}
          </View>
        <AddressModal
          isOpen={showAddressModal}
          address={selectedAddress}
          onClose={() => {
            setShowAddressModal(false);
            setSelectedAddress(null);
          }}
          onSubmit={handleAddressModalSubmit}
        />
      </SafeAreaView>
  );
}
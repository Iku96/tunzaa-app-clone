import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Star,
  CreditCard as Edit2,
  Trash2,
} from "lucide-react-native";
import { AddressModal } from "@/components/modals/AddressModal";
import { Alert } from "@/components/ui/alert";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import { Terminal } from "@/lib/icons/Terminal";
import { usePageTitle } from "@/hooks/usePageTitle";

const mockAddresses = [
  {
    id: "1",
    title: "Home",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "Dar es Salaam",
    country: "Tanzania",
    isDefault: true,
  },
  {
    id: "2",
    title: "Office",
    line1: "456 Business Avenue",
    line2: "Floor 3",
    city: "Dar es Salaam",
    country: "Tanzania",
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState(mockAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  usePageTitle("Addresses");
  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleEdit = (address: any) => {
    setSelectedAddress(address);
    setShowAddressModal(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleAddressSubmit = (address: any) => {
    if (selectedAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === selectedAddress.id ? { ...address, id: addr.id } : addr
        )
      );
    } else {
      setAddresses([...addresses, { ...address, id: Date.now().toString() }]);
    }
    setShowAddressModal(false);
    setSelectedAddress(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          Delivery Addresses
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 p-4">
        {addresses.map((address) => (
          <View
            key={address.id}
            className="bg-card rounded-xl p-4 mb-4 border border-border"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center gap-2">
                <MapPin size={20} className="text-muted-foreground" />
                <Text className="text-base font-semibold text-foreground">
                  {address.title}
                </Text>
                {address.isDefault && (
                  <View className="flex-row items-center bg-warning/10 px-2 py-1 rounded-full gap-1">
                    <Star
                      size={12}
                      className="text-warning"
                      fill="currentColor"
                    />
                    <Text className="text-xs font-semibold text-warning">
                      Default
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="p-2 bg-secondary rounded-lg"
                  onPress={() => handleEdit(address)}
                >
                  <Edit2 size={16} className="text-muted-foreground" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2 bg-secondary rounded-lg"
                  onPress={() => handleDelete(address.id)}
                >
                  <Trash2 size={16} className="text-destructive" />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm text-muted-foreground mb-1">
              {address.line1}
            </Text>
            {address.line2 && (
              <Text className="text-sm text-muted-foreground mb-1">
                {address.line2}
              </Text>
            )}
            <Text className="text-sm text-muted-foreground">
              {address.city}, {address.country}
            </Text>

            {!address.isDefault && (
              <Button
                variant="secondary"
                className="mt-3 self-start"
                onPress={() => handleSetDefault(address.id)}
              >
                Set as Default
              </Button>
            )}
          </View>
        ))}

        <Button
          variant="outline"
          className="flex-row items-center justify-center mt-2 gap-2"
          onPress={() => setShowAddressModal(true)}
        >
          <Plus size={24} className="text-success" />
          <Text className="text-base font-semibold text-success">
            Add New Address
          </Text>
        </Button>
      </ScrollView>

      <AddressModal
        isOpen={showAddressModal}
        address={selectedAddress}
        onClose={() => {
          setShowAddressModal(false);
          setSelectedAddress(null);
        }}
        onSubmit={handleAddressSubmit}
      />
    </SafeAreaView>
  );
}

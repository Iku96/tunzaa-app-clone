import { useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Mail,
  Shield,
  ChevronRight,
  Store,
} from "lucide-react-native";
import { useTunzaaAuth as useAuth } from "@/src/contexts/TunzaaAuthContext";
import { PERMISSIONS } from "@/config/permissions";
import { PasswordResetModal } from "@/components/modals/PasswordResetModal";
import { ProfileUpdateModal } from "@/components/modals/ProfileUpdateModal";
import { FileText } from "@/lib/icons/FileText";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { DesktopLayoutWrapper } from "@/components/layout";
import { useResponsive } from "@/hooks/useResponsive";
import { useGetUserDetails } from "@/src/services/auth";
import DeleteAccount from "@/components/account/DeleteAccount";

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { user, logout, hasPermission } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isDesktop } = useResponsive();
  const { refetch: refetchUserDetails } = useGetUserDetails(user?.user_id || "");
  const currentProfile = user?.profiles.find(
    (profile) => profile.role === user.activeProfileRole
  );

  if (!currentProfile) return null;

  const handleProfileUpdateSuccess = async () => {
    await refetchUserDetails();
    setShowProfileModal(false);
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showSecondaryNav={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <SafeAreaView className="flex-1 bg-background">
        {!isDesktop && <View className="flex-row justify-between items-center p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            Account Details
          </Text>
          <View className="w-6" />
        </View>}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="p-4 gap-4" style={{
              alignSelf: "center",
              width: isDesktop ? 600 : "100%",
            }}>
              <View className="items-center p-6 bg-secondary/10">
                <TouchableOpacity
                  className="relative mb-4"
                  onPress={() => setShowProfileModal(true)}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200&h=200",
                    }}
                    className="w-[120px] h-[120px] rounded-full"
                  />
                  <View className="absolute right-0 bottom-0 bg-success p-2 rounded-full">
                    <Camera size={20} className="text-background" />
                  </View>
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-foreground mb-1">
                  {currentProfile.displayName}
                </Text>
                <Text className="text-base text-muted-foreground">
                  {currentProfile.role.charAt(0).toUpperCase() +
                    currentProfile.role.slice(1)}{" "}
                  Account
                </Text>
              </View>

              <View className="p-4 border-b border-border">
                <Text className="text-lg font-semibold text-foreground mb-4">
                  Personal Information
                </Text>

                <View className="flex-row items-center py-3">
                  <Mail size={20} className="text-muted-foreground" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm text-muted-foreground">
                      Email Address
                    </Text>
                    <Text className="text-base font-semibold text-foreground mt-0.5">
                      {user?.email}
                    </Text>
                  </View>
                </View>

                {currentProfile.contactNumber && (
                  <View className="flex-row items-center py-3">
                    <Phone size={20} className="text-muted-foreground" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm text-muted-foreground">
                        Phone Number
                      </Text>
                      <Text className="text-base font-semibold text-foreground mt-0.5">
                        {currentProfile.contactNumber}
                      </Text>
                    </View>
                  </View>
                )}

                {currentProfile.address && (
                  <View className="flex-row items-center py-3">
                    <MapPin size={20} className="text-muted-foreground" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm text-muted-foreground">
                        Primary Address
                      </Text>
                      <Text className="text-base font-semibold text-foreground mt-0.5">
                        {currentProfile.address.line1}, {currentProfile.address.city}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push("/account/addresses")}
                    >
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {hasPermission(PERMISSIONS.STORE_UPDATE) && currentProfile.storeDetails && (
                <View className="p-4 border-b border-border">
                  <Text className="text-lg font-semibold text-foreground mb-4">
                    Business Information
                  </Text>

                  <View className="flex-row items-center py-3">
                    <Store size={20} className="text-muted-foreground" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm text-muted-foreground">
                        Store Name
                      </Text>
                      <Text className="text-base font-semibold text-foreground mt-0.5">
                        {currentProfile.storeDetails.storeName}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center py-3">
                    <MapPin size={20} className="text-muted-foreground" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm text-muted-foreground">
                        Store Address
                      </Text>
                      <Text className="text-base font-semibold text-foreground mt-0.5">
                        {currentProfile.storeDetails.storeAddress}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center py-3">
                    <FileText size={20} className="text-muted-foreground" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm text-muted-foreground">
                        Registration Number
                      </Text>
                      <Text className="text-base font-semibold text-foreground mt-0.5">
                        {currentProfile.storeDetails.registrationNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className="p-4 border-b border-border">
                <Text className="text-lg font-semibold text-foreground mb-4">
                  Security
                </Text>

                <TouchableOpacity
                  className="flex-row items-center bg-secondary p-4 rounded-xl"
                  onPress={() => setShowPasswordModal(true)}
                >
                  <Shield size={20} className="text-muted-foreground" />
                  <Text className="flex-1 ml-3 text-base font-semibold text-foreground">
                    Change Password
                  </Text>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </TouchableOpacity>
              </View>

              {/* Account Deletion */}
              <DeleteAccount />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        <PasswordResetModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />

        <ProfileUpdateModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={user}
          onSuccess={handleProfileUpdateSuccess}
        />
      </SafeAreaView>
    </DesktopLayoutWrapper>

  );
}

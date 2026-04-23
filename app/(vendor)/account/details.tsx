import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Shield,
  ChevronRight,
  Store,
  Edit2,
} from "lucide-react-native";

import { useAuth } from "@/context/auth";
import { PERMISSIONS } from "@/config/permissions";
import { PasswordResetModal } from "@/components/modals/PasswordResetModal";
import { ProfileUpdateModal } from "@/components/modals/ProfileUpdateModal";
import { VendorProfileModal } from "@/components/modals/VendorProfileModal";
import { useI18n } from "@/hooks/useI18n";
import { FileText } from "@/lib/icons/FileText";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useGetUserDetails } from "@/services/auth";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import DeleteAccount from "@/components/account/DeleteAccount";

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();

  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && screenWidth >= 1024;
  const { refetch: refetchUserDetails } = useGetUserDetails(user?.user_id || "");

  const currentProfile = user?.profiles.find(
    (p) => p.role === user.activeProfileRole
  );

  if (!currentProfile) return null;

  // Get user initials from display name
  const getInitials = (name: string): string => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleProfileUpdateSuccess = async () => {
    await refetchUserDetails();
    setShowProfileModal(false);
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Header (Mobile Only) */}
        {!isDesktop && (
          <View className="flex-row items-center p-4 border-b border-border">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={resolvedColors?.foreground} />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-lg font-semibold text-foreground">
              {t("account.account_details")}
            </Text>
            <View className="w-6" />
          </View>
        )}

        {/* Content */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: isDesktop ? "center" : "flex-start",
            paddingHorizontal: 16,
            paddingVertical: 24,
          }}
        >
          {/* Profile Header */}
          <View className="items-center mb-6 w-full max-w-2xl">
            {/* Avatar with Initials */}
            <Avatar
              alt={currentProfile.displayName}
              className="w-32 h-32 mb-4 border-4 border-muted"
            >
              <AvatarFallback
                className="bg-primary"
                style={{ backgroundColor: resolvedColors?.primary || "#3B82F6" }}
              >
                <Text className="text-5xl font-bold text-primary-foreground">
                  {getInitials(currentProfile.displayName)}
                </Text>
              </AvatarFallback>
            </Avatar>

            {/* Name and Role */}
            <View className="items-center max-w-full px-4">
              <Text className="text-2xl font-bold text-center text-foreground mb-2" numberOfLines={2}>
                {currentProfile.displayName}
              </Text>

              <Badge variant="outline" className="mb-3">
                <Text className="text-sm">
                  {t("account.account_type", {
                    role: currentProfile.role.charAt(0).toUpperCase() + currentProfile.role.slice(1)
                  })}
                </Text>
              </Badge>

              {/* Edit Profile Button */}
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowProfileModal(true)}
                className="flex-row items-center"
              >
                <Edit2 size={16} color={resolvedColors?.foreground} />
                <Text className="ml-2">
                  {t("account.edit_profile")}
                </Text>
              </Button>
            </View>
          </View>

          {/* Details Sections */}
          <View className="w-full max-w-2xl mt-4">
            {/* Personal Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("account.personal_information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow
                  icon={<Mail size={20} color={resolvedColors?.mutedForeground} />}
                  label={t("account.email")}
                  value={user?.email ?? ""}
                />
                {user?.phone_number && (
                  <>
                    <Separator className="my-3" />
                    <InfoRow
                      icon={<Phone size={20} color={resolvedColors?.mutedForeground} />}
                      label={t("account.phone")}
                      value={user.phone_number}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Business Information - Vendor Only */}
            {hasPermission(PERMISSIONS.STORE_UPDATE) && currentProfile.storeDetails && (
              <Card className="mb-6">
                <CardHeader>
                  <View className="flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                      {t("account.business_information")}
                    </CardTitle>
                    <TouchableOpacity
                      onPress={() => setShowVendorModal(true)}
                      className="flex-row items-center"
                    >
                      <Edit2 size={16} color={resolvedColors?.primary} />
                      <Text className="ml-1 text-sm font-medium text-primary">
                        {t("common.edit")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </CardHeader>
                <CardContent className="pt-0">
                  <InfoRow
                    icon={<Store size={20} color={resolvedColors?.mutedForeground} />}
                    label={t("store.store_name")}
                    value={currentProfile.storeDetails.storeName}
                  />
                  <Separator className="my-3" />
                  <InfoRow
                    icon={<MapPin size={20} color={resolvedColors?.mutedForeground} />}
                    label={t("store.store_address")}
                    value={currentProfile.storeDetails.storeAddress}
                  />
                  <Separator className="my-3" />
                  <InfoRow
                    icon={<FileText size={20} color={resolvedColors?.mutedForeground} />}
                    label={t("store.registration_number")}
                    value={currentProfile.storeDetails.registrationNumber}
                  />
                </CardContent>
              </Card>
            )}

            {/* Security */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("account.security")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setShowPasswordModal(true)}
                >
                  <Shield size={20} color={resolvedColors?.mutedForeground} />
                  <Text className="flex-1 ml-3 text-base font-medium text-foreground">
                    {t("account.change_password")}
                  </Text>
                  <ChevronRight size={20} color={resolvedColors?.mutedForeground} />
                </TouchableOpacity>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <DeleteAccount />
          </View>
        </ScrollView>

        {/* Modals */}
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

        {hasPermission(PERMISSIONS.STORE_UPDATE) && (
          <VendorProfileModal
            isOpen={showVendorModal}
            onClose={() => setShowVendorModal(false)}
          />
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}

/* ------------------------------
   Helper Components
------------------------------ */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}) {
  return (
    <View className="flex-row items-start">
      <View className="mt-0.5">{icon}</View>
      <View className="ml-3 flex-1">
        <Text className="text-sm text-muted-foreground mb-1">
          {label}
        </Text>
        <Text className="text-base font-medium text-foreground" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

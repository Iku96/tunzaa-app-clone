import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
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
  Edit2,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { PERMISSIONS } from "@/config/permissions";
import { PasswordResetModal } from "@/components/modals/PasswordResetModal";
import { ProfileUpdateModal } from "@/components/modals/ProfileUpdateModal";
import { FileText } from "@/lib/icons/FileText";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { authApi, useGetUserDetails } from "@/src/services/auth";
import { useI18n } from "@/hooks/useI18n";
import * as Burnt from "burnt";

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { user, logout, hasPermission } = useAuth();
  const { t } = useI18n();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && screenWidth >= 1024;
  const { refetch: refetchUserDetails } = useGetUserDetails(user?.user_id || "");
  const currentProfile = user?.profiles.find(
    (p) => p.role === user.activeProfileRole
  );

  if (!currentProfile) return null;

  const handleProfileUpdateSuccess = async () => {
    await refetchUserDetails();
    setShowProfileModal(false);
  };

  const handleDeleteAccount = () => {
    console.log("🔴 [Deactivate Account] handleDeleteAccount triggered");
    const title = t("account.delete_account");
    const message = t("account.are_you_sure_delete_full");

    if (Platform.OS === "web") {
      if (confirm(`${title}\n\n${message}`)) {
        (async () => {
          console.log("🌐 [Deactivate Account] Web path confirmed");
          const userId = user?.user_id || user?.id;
          console.log("🛠️ [Deactivate Account] Platform: Web, Attempting with userId:", userId);
          if (!userId) {
            console.error("No user ID found for deletion");
            alert(t("account.account_deleted_failed"));
            return;
          }
          setIsDeleting(true);
          try {
            await authApi.disableUser();
            alert(t("account.account_deleted_success"));
            logout();
          } catch (error) {
            console.error("Failed to delete account:", error);
            alert(t("account.account_deleted_failed"));
          } finally {
            setIsDeleting(false);
          }
        })();
      }
      return;
    }

    Alert.alert(
      title,
      message,
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            console.log("📱 [Deactivate Account] Mobile path confirmed (Delete pressed)");
            setIsDeleting(true);
            try {
              await authApi.disableUser();
              Burnt.toast({
                title: t("account.account_deleted_success"),
                preset: "done",
              });
              logout();
            } catch (error) {
              console.error("Failed to delete account:", error);
              Burnt.toast({
                title: t("account.account_deleted_failed"),
                preset: "error",
              });
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {!isDesktop && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {t("account.account_details")}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: isDesktop ? "center" : "flex-start",
          padding: 24,
        }}
      >
        {/* Profile Header with Edit Button */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          {/* Avatar with Camera Icon */}
          <View style={{ position: "relative", marginBottom: 16 }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200&h=200",
              }}
              className="w-[120px] h-[120px] rounded-full"
              style={{ borderWidth: 4, borderColor: "#f3f4f6" }}
            />
            <TouchableOpacity
              onPress={() => setShowProfileModal(true)}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#10b981",
                padding: 10,
                borderRadius: 24,
                borderWidth: 3,
                borderColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Name and Role with Edit Button */}
          <View style={{ alignItems: "center", position: "relative" }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {currentProfile.displayName}
            </Text>
            <View
              style={{
                backgroundColor: "#f3f4f6",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {t("account.account_type", { role: currentProfile.role.charAt(0).toUpperCase() + currentProfile.role.slice(1) })}
              </Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              onPress={() => setShowProfileModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f9fafb",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Edit2 size={16} color="#6b7280" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                {t("account.edit_profile")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ width: isDesktop ? 600 : "100%", marginTop: 16 }}>
          <Section title={t("account.personal_information")}>
            <InfoRow
              icon={<Mail size={20} color="#6b7280" />}
              label={t("account.email")}
              value={user?.email ?? ""}
            />
            {currentProfile.contactNumber && (
              <InfoRow
                icon={<Phone size={20} color="#6b7280" />}
                label={t("account.phone")}
                value={currentProfile.contactNumber}
              />
            )}
            {currentProfile.address && (
              <TouchableOpacity
                onPress={() => router.push("/account/addresses")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f3f4f6",
                }}
              >
                <MapPin size={20} color="#6b7280" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    {t("account.primary_address")}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "500" }}>
                    {currentProfile.address.line1}, {currentProfile.address.city}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </Section>

          {hasPermission(PERMISSIONS.STORE_UPDATE) && currentProfile.storeDetails && (
            <Section title={t("account.business_information")}>
              <InfoRow
                icon={<Store size={20} color="#6b7280" />}
                label={t("account.store_name")}
                value={currentProfile.storeDetails.storeName}
              />
              <InfoRow
                icon={<MapPin size={20} color="#6b7280" />}
                label={t("account.store_address")}
                value={currentProfile.storeDetails.storeAddress}
              />
              <InfoRow
                icon={<FileText size={20} color="#6b7280" />}
                label={t("account.reg_number")}
                value={currentProfile.storeDetails.registrationNumber}
              />
            </Section>
          )}

          <Section title={t("account.security")}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
              onPress={() => setShowPasswordModal(true)}
            >
              <Shield size={20} color="#6b7280" />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                {t("account.change_password")}
              </Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Section>

          <Section title={t("account.danger_zone")}>
            <View style={{ padding: 16 }}>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onPress={handleDeleteAccount}
              >
                {isDeleting ? t("common.deleting") : t("account.delete_account")}
              </Button>
            </View>
          </Section>
        </View>
      </ScrollView>

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
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 16,
          color: "#111827",
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
      }}
    >
      {icon}
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
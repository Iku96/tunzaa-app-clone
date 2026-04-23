import React from "react";
import { View, TouchableOpacity } from "react-native";
import { CircleAlert as AlertCircle } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import * as Burnt from "burnt";

export function ActivationStatusCard() {
  const { user } = useAuth();
  const colors = useResolvedThemeColors();

  const currentProfile = user?.profiles.find(
    (profile) => profile.role === user.activeProfileRole
  );

  // Get verification status based on current role
  const getActivationStatus = () => {
    if (user?.activeProfileRole === 'vendor' && user?.vendorDetails) {
      const activationStatus = user.is_active;

      return activationStatus;
      };
    }


  const activationStatus = getActivationStatus();

  const getStatusColor = () => {
    if (activationStatus) {
      return colors?.success || "#10b981";
    }
    if (!activationStatus) {
      return colors?.destructive || "#ef4444";
    }
    return colors?.warning || "#f59e0b";
  };

  const getStatusBackgroundColor = () => {
    if (activationStatus) {
      return colors?.successWithOpacity?.(0.1) || "rgba(16, 185, 129, 0.1)";
    }
    if (!activationStatus) {
      return colors?.destructiveWithOpacity?.(0.1) || "rgba(239, 68, 68, 0.1)";
    }
    return colors?.warningWithOpacity?.(0.1) || "rgba(245, 158, 11, 0.1)";
  };

  const getStatusBorderColor = () => {
    if (activationStatus) {
      return colors?.successWithOpacity?.(0.2) || "rgba(16, 185, 129, 0.2)";
    }
    if (!activationStatus) {
      return colors?.destructiveWithOpacity?.(0.2) || "rgba(239, 68, 68, 0.2)";
    }
    return colors?.warningWithOpacity?.(0.2) || "rgba(245, 158, 11, 0.2)";
  };

  return (
    <></>
    // <TouchableOpacity
    //   className="flex-row items-center p-3 rounded-xl border"
    //   style={{
    //     backgroundColor: getStatusBackgroundColor(),
    //     borderColor: getStatusBorderColor(),
    //   }}
    //   //on press let's simply implement a toast using Bu 
    //   onPress={() => {
    //     Burnt.toast({
    //       title: activationStatus ? "Account Active" : "Account Inactive",
    //       message: activationStatus ? "Account is active" : "Account is inactive",
    //       preset: activationStatus ? "done" : "error",
    //       haptic: activationStatus ? "success" : "error",
    //       duration: 3,
    //       from: "top",
    //     });
    //   }}
    // >
    //   <AlertCircle size={20} color={getStatusColor()} />
    //   <Text
    //     className="ml-2 text-sm font-semibold"
    //     style={{ color: getStatusColor() }}
    //   >
    //     {activationStatus ? "Account Active" : "Account Inactive"}
    //   </Text>
    // </TouchableOpacity>
  );
} 
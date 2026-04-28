import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { CircleAlert as AlertCircle, XCircle, FileText } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface VerificationCardProps {
  onPress: () => void;
}

export function VerificationCard({ onPress }: VerificationCardProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const colors = useResolvedThemeColors();

  const currentProfile = user?.profiles.find(
    (profile) => profile.role === user.activeProfileRole
  );

  // Get verification status based on current role
  const getVerificationStatus = () => {
    console.log('user?.activeProfileRole', user?.activeProfileRole);
    console.log('user details:', JSON.stringify(user, null, 2));
    if (user?.activeProfileRole === 'vendor' && user?.vendorDetails) {
      const vendorDetails = user.vendorDetails;
      const documents = vendorDetails.verification_documents || [];
      const verificationStatus = vendorDetails.verification_status;
      
      // Check document-level statuses to determine actual state
      const pendingDocuments = documents.filter((doc: any) => 
        doc.verification_status?.toLowerCase() === "pending"
      );
      const rejectedDocuments = documents.filter((doc: any) => 
        doc.verification_status?.toLowerCase() === "rejected" && doc.rejection_reason
      );
      const approvedDocuments = documents.filter((doc: any) => 
        doc.verification_status?.toLowerCase() === "approved"
      );

      // If documents are pending (even if vendor status is rejected), show as pending (resubmitted)
      const hasPendingDocs = pendingDocuments.length > 0;
      const hasRejectedDocs = rejectedDocuments.length > 0 && pendingDocuments.length === 0;
      const isActuallyPending = hasPendingDocs || (verificationStatus === "pending" && documents.length > 0);

      return {
        isVerified: verificationStatus === "approved" || (documents.length > 0 && documents.length === approvedDocuments.length),
        status: isActuallyPending ? "pending" : verificationStatus || "not_started",
        hasRejectedDocuments: hasRejectedDocs,
        rejectedDocuments: rejectedDocuments,
        statusText: verificationStatus === "approved" || (documents.length > 0 && documents.length === approvedDocuments.length)
          ? t("verification.account_verified")
          : isActuallyPending
          ? t("verification.verification_pending")
          : hasRejectedDocs
          ? t("verification.verification_rejected")
          : t("verification.submit_kyc_documents")
      };
    }

    // For delivery partners, use deliveryDetails KYC status
    if (user?.activeProfileRole === 'delivery' && user?.deliveryDetails) {
      const deliveryDetails = user.deliveryDetails;
      const documents = deliveryDetails.kyc?.documents || [];
      const rejectedDocuments = documents.filter((doc: any) => doc.rejection_reason);
      const pendingDocuments = documents.filter((doc: any) => !doc.verified && !doc.rejection_reason);
      
      return {
        isVerified: deliveryDetails.kyc?.verified || false,
        status: deliveryDetails.kyc?.verified ? "verified" : rejectedDocuments.length > 0 ? "rejected" : "pending",
        hasRejectedDocuments: rejectedDocuments.length > 0,
        rejectedDocuments: rejectedDocuments,
        pendingDocuments: pendingDocuments,
        statusText: deliveryDetails.kyc?.verified 
          ? t("verification.account_verified")
          : rejectedDocuments.length > 0
          ? t("verification.verification_rejected")
          : pendingDocuments.length > 0
          ? t("verification.verification_pending")
          : t("verification.submit_kyc_documents")
      };
    }

    // For other roles (buyer, affiliate), use the profile KYC status
    if (currentProfile) {
      return {
        isVerified: currentProfile.kyc?.verified || false,
        status: currentProfile.kyc?.verified ? "verified" : "not_verified",
        hasRejectedDocuments: false,
        rejectedDocuments: [],
        pendingDocuments: [],
        statusText: currentProfile.kyc?.verified ? t("verification.verified_account") : t("verification.unverified_account")
      };
    }

    return {
      isVerified: false,
      status: "not_started",
      hasRejectedDocuments: false,
      rejectedDocuments: [],
      pendingDocuments: [],
      statusText: t("verification.submit_kyc_documents")
    };
  };

  const verificationInfo = getVerificationStatus();

  const renderRejectionDetails = () => {
    if (!verificationInfo.hasRejectedDocuments || !verificationInfo.rejectedDocuments?.length) {
      return null;
    }

    return (
      <View className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50">
        <View className="flex-row items-center mb-2">
          <XCircle size={16} color={colors?.destructive || "#ef4444"} />
          <Text className="ml-2 text-sm font-medium text-red-800">
            {t("verification.rejected_documents")}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {verificationInfo.rejectedDocuments.map((doc: any, index: number) => (
            <View key={doc.document_id || index} className="mr-3 p-2 rounded border border-red-200 bg-white min-w-[200px]">
              <View className="flex-row items-center mb-1">
                <FileText size={14} color={colors?.destructive || "#ef4444"} />
                <Text className="ml-1 text-xs font-medium text-red-800 flex-1" numberOfLines={1}>
                  {doc.document_type_name || t("verification.document")}
                </Text>
              </View>
              <Text className="text-xs text-red-600" numberOfLines={2}>
                {doc.rejection_reason || t("verification.no_reason_provided")}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const getStatusColor = () => {
    if (verificationInfo.isVerified) {
      return colors?.success || "#10b981";
    }
    if (verificationInfo.status === "rejected" || verificationInfo.hasRejectedDocuments) {
      return colors?.destructive || "#ef4444";
    }
    return colors?.warning || "#f59e0b";
  };

  const getStatusBackgroundColor = () => {
    if (verificationInfo.isVerified) {
      return colors?.successWithOpacity?.(0.1) || "rgba(16, 185, 129, 0.1)";
    }
    if (verificationInfo.status === "rejected" || verificationInfo.hasRejectedDocuments) {
      return colors?.destructiveWithOpacity?.(0.1) || "rgba(239, 68, 68, 0.1)";
    }
    return colors?.warningWithOpacity?.(0.1) || "rgba(245, 158, 11, 0.1)";
  };

  const getStatusBorderColor = () => {
    if (verificationInfo.isVerified) {
      return colors?.successWithOpacity?.(0.2) || "rgba(16, 185, 129, 0.2)";
    }
    if (verificationInfo.status === "rejected" || verificationInfo.hasRejectedDocuments) {
      return colors?.destructiveWithOpacity?.(0.2) || "rgba(239, 68, 68, 0.2)";
    }
    return colors?.warningWithOpacity?.(0.2) || "rgba(245, 158, 11, 0.2)";
  };

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center p-3 rounded-xl border"
        style={{
          backgroundColor: getStatusBackgroundColor(),
          borderColor: getStatusBorderColor(),
        }}
        onPress={onPress}
      >
        <AlertCircle size={20} color={getStatusColor()} />
        <Text
          className="ml-2 text-sm font-semibold"
          style={{ color: getStatusColor() }}
        >
          {verificationInfo.statusText}
        </Text>
      </TouchableOpacity>
      
      {/* Show rejection details if any */}
      {renderRejectionDetails()}
    </View>
  );
} 
import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { CheckCircle, XCircle, Clock, FileText, Calendar } from "lucide-react-native";

interface DocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorDetails: {
    verification_status: string;
    verification_documents: Array<{
      document_id: string;
      document_type_name: string;
      document_type_description?: string;
      number: string;
      document_url: string;
      verification_status: string;
      rejection_reason?: string;
      submitted_at: string;
      verified_at?: string;
      expires_at?: string;
    }>;
  };
  onResubmit?: () => void;
}

export function DocumentStatusModal({
  isOpen,
  onClose,
  vendorDetails,
  onResubmit,
}: DocumentStatusModalProps) {
  const colors = useResolvedThemeColors();
  const isApproved = vendorDetails.verification_status === "approved";
  const isRejected = vendorDetails.verification_status === "rejected";
  const isPending = vendorDetails.verification_status === "pending";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={20} color={colors?.success || "#10b981"} />;
      case "rejected":
        return <XCircle size={20} color={colors?.destructive || "#ef4444"} />;
      case "pending":
        return <Clock size={20} color={colors?.warning || "#f59e0b"} />;
      default:
        return <FileText size={20} color={colors?.mutedForeground || "#6b7280"} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-success/10 border-success/20";
      case "rejected":
        return "bg-destructive/10 border-destructive/20";
      case "pending":
        return "bg-warning/10 border-warning/20";
      default:
        return "bg-muted/10 border-muted/20";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "default" as const;
      case "rejected":
        return "destructive" as const;
      case "pending":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getOverallStatusColor = () => {
    if (isApproved) return colors?.success || "#10b981";
    if (isRejected) return colors?.destructive || "#ef4444";
    return colors?.warning || "#f59e0b";
  };

  const getOverallStatusBackground = () => {
    if (isApproved) return colors?.successWithOpacity?.(0.1) || "rgba(16, 185, 129, 0.1)";
    if (isRejected) return colors?.destructiveWithOpacity?.(0.1) || "rgba(239, 68, 68, 0.1)";
    return colors?.warningWithOpacity?.(0.1) || "rgba(245, 158, 11, 0.1)";
  };

  const getOverallStatusText = () => {
    if (isApproved) return "Account Verified";
    if (isRejected) return "Verification Rejected";
    return "Verification Pending";
  };

  const getOverallStatusDescription = () => {
    if (isApproved) return "Your account has been successfully verified and is ready for business.";
    if (isRejected) return "Your verification was rejected. Please review the issues below and resubmit.";
    return "Your documents are being reviewed. We'll notify you once the verification is complete.";
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Document Verification Status"
      snapPoints={["90%"]}
      footer={
        <View className="flex-row gap-3">
          <Button variant="secondary" className="flex-1" onPress={onClose}>
            <Text className="font-semibold">Close</Text>
          </Button>
          {(isRejected || vendorDetails.verification_documents.some(doc => doc.verification_status === "rejected")) && onResubmit && (
            <Button variant="default" className="flex-1" onPress={onResubmit}>
              <Text className="text-primary-foreground font-semibold">Resubmit Documents</Text>
            </Button>
          )}
        </View>
      }
    >
      <ScrollView className="flex-1">
        {/* Overall Status Header */}
        <View
          className="p-4 rounded-xl mb-6 border"
          style={{
            backgroundColor: getOverallStatusBackground(),
            borderColor: getOverallStatusColor(),
          }}
        >
                     <View className="flex-row items-center mb-2">
             {isApproved && <CheckCircle size={24} color={getOverallStatusColor()} />}
             {isRejected && <XCircle size={24} color={getOverallStatusColor()} />}
             {isPending && <Clock size={24} color={getOverallStatusColor()} />}
             <Text
               className="ml-2 text-lg font-bold"
               style={{ color: getOverallStatusColor() }}
             >
               {getOverallStatusText()}
             </Text>
           </View>
          <Text className="text-sm text-muted-foreground">
            {getOverallStatusDescription()}
          </Text>
        </View>

        {/* Documents List */}
        <View className="gap-4">
          <Text className="text-lg font-semibold text-foreground mb-2">
            Submitted Documents
          </Text>

          {vendorDetails.verification_documents.map((document) => (
            <View
              key={document.document_id}
              className={`p-4 rounded-xl border ${getStatusColor(document.verification_status)}`}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    {getStatusIcon(document.verification_status)}
                    <Text className="ml-2 text-base font-semibold text-foreground">
                      {document.document_type_name}
                    </Text>
                  </View>
                  {document.document_type_description && (
                    <Text className="text-sm text-muted-foreground mb-2">
                      {document.document_type_description}
                    </Text>
                  )}
                  {document.number && (
                    <Text className="text-sm text-muted-foreground">
                      Document Number: {document.number}
                    </Text>
                  )}
                </View>
                <Badge variant={getStatusBadgeVariant(document.verification_status)}>
                  {document.verification_status.charAt(0).toUpperCase() + document.verification_status.slice(1)}
                </Badge>
              </View>

              {/* Document Image Preview */}
              {document.document_url && (
                <TouchableOpacity
                  className="mb-3 rounded-lg overflow-hidden border border-border"
                  style={{ height: 120 }}
                >
                  <Image
                    source={{ uri: document.document_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}

              {/* Rejection Reason */}
              {document.verification_status === "rejected" && document.rejection_reason && (
                <View
                  className="p-3 rounded-lg mb-3 border"
                  style={{
                    backgroundColor: colors?.destructiveWithOpacity?.(0.05) || "rgba(239, 68, 68, 0.05)",
                    borderColor: colors?.destructiveWithOpacity?.(0.2) || "rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <Text className="text-sm font-medium text-destructive mb-1">
                    Rejection Reason:
                  </Text>
                  <Text className="text-sm text-destructive">
                    {document.rejection_reason}
                  </Text>
                </View>
              )}

              {/* Timestamps */}
                             <View className="flex-row items-center justify-between text-xs text-muted-foreground">
                 <View className="flex-row items-center">
                   <Calendar size={12} color={colors?.mutedForeground || "#6b7280"} className="mr-1" />
                   <Text className="text-xs text-muted-foreground">
                     Submitted: {formatDate(document.submitted_at)}
                   </Text>
                 </View>
                {document.verified_at && (
                  <Text className="text-xs text-muted-foreground">
                    Verified: {formatDate(document.verified_at)}
                  </Text>
                )}
              </View>

              {document.expires_at && (
                <View className="mt-2 pt-2 border-t border-border">
                  <Text className="text-xs text-muted-foreground">
                    Expires: {formatDate(document.expires_at)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Help Section */}
        <View className="mt-6 p-4 bg-muted/10 rounded-xl">
          <Text className="text-sm font-medium text-foreground mb-2">
            Need Help?
          </Text>
          <Text className="text-sm text-muted-foreground">
            If you have questions about your verification status, please contact our support team.
          </Text>
        </View>
      </ScrollView>
    </ResponsiveModal>
  );
} 
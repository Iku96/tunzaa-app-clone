import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useAuth } from "@/context/auth";
import type { UserRole } from "@/context/auth";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/ui/file-uploader";
import { useEntities } from "@/services/configuration";
import { useSubmitVendorKyc, useSubmitDeliveryKyc } from "@/services/kyc";
import type { EntityDocumentType } from "@/services/configuration";
import type { VendorKycDocument, DeliveryKycDocument } from "@/services/kyc";
import { API_CONFIG } from "@/services/config";
import * as Burnt from "burnt";

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback after successful submission
  user?: any; // User object from auth context
  userRole?: UserRole; // Active user role
}

interface DocumentUpload {
  document_type_id: string;
  name: string;
  description: string;
  is_required: boolean;
  document_url?: string;
  document_number?: string; // For delivery partners
}

export function KycModal({ isOpen, onClose, onSuccess, user: propUser, userRole: propUserRole }: KycModalProps) {
  const authContext = useAuth();
  const user = propUser || authContext.user;
  const userRole = propUserRole || user?.activeProfileRole;
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Only fetch entities if modal is open and user role is supported
  const shouldFetchEntities = isOpen && userRole && ["vendor", "delivery"].includes(userRole);

  // Validate tenant ID
  const tenantId = API_CONFIG.TENANT_ID;
  if (!tenantId) {
    console.error("KycModal: Missing tenant ID");
  }

  // Fetch entities based on tenant - only when needed
  const {
    data: entitiesData,
    isLoading: entitiesLoading,
    error: entitiesError,
  } = useEntities(
    {
      tenant_id: tenantId || "",
    },
    shouldFetchEntities && !!tenantId
  );

  // KYC mutation hooks
  const vendorKycMutation = useSubmitVendorKyc();
  const deliveryKycMutation = useSubmitDeliveryKyc();

  // Reset success state when modal is closed/reopened
  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Initialize documents when entities data is loaded
  useEffect(() => {
    if (!entitiesData || !userRole) {
      return;
    }

    if (!entitiesData.items || !Array.isArray(entitiesData.items)) {
      console.error("Invalid entities data structure:", entitiesData);
      return;
    }

    const entity = entitiesData.items.find(
      (entity) => entity && entity.name && entity.name.toLowerCase() === userRole.toLowerCase()
    );

    if (entity && entity.document_types && Array.isArray(entity.document_types)) {
      try {
        const initialDocuments: DocumentUpload[] = entity.document_types
          .filter(docType => docType && docType.document_type_id)
          .map((docType: EntityDocumentType) => {
            let existingDocument = null;
            
            // Load existing documents for delivery partners
            if (userRole === "delivery" && user?.deliveryDetails?.kyc?.documents) {
              existingDocument = user.deliveryDetails.kyc.documents.find(
                (doc: any) => doc.document_type_id === docType.document_type_id
              );
            }
            
            // Load existing documents for vendors
            if (userRole === "vendor" && user?.vendorDetails?.verification_documents) {
              existingDocument = user.vendorDetails.verification_documents.find(
                (doc: any) => doc.document_type_id === docType.document_type_id
              );
            }

            const cleanedDocType = {
              document_type_id: String(docType.document_type_id || "").trim(),
              name: String(docType.name || "Document").trim(),
              description: String(docType.description || "").trim(),
              is_required: Boolean(docType.is_required),
              document_url: existingDocument?.link || existingDocument?.document_url || undefined,
              document_number: existingDocument?.number || undefined,
            };

            return cleanedDocType;
          });

        setDocuments(initialDocuments);
      } catch (error) {
        console.error("Error processing entities data:", error);
        console.error("Error stack:", (error as Error)?.stack);
      }
    }
  }, [entitiesData, userRole, user]);

  const updateDocument = (
    document_type_id: string,
    field: "document_url" | "document_number",
    value: string
  ) => {
    const docTypeId = String(document_type_id);
    const fieldValue = String(value || "");

    setDocuments((prev) =>
      prev.map((doc) =>
        String(doc.document_type_id) === docTypeId
          ? { ...doc, [field]: fieldValue }
          : doc
      )
    );
  };

  const handleSubmit = async () => {
    if (!user || !userRole) {
      Burnt.toast({
        title: "Error",
        preset: "error",
        message: "User information is missing",
        haptic: "error",
        duration: 3,
        from: "top",
      });
      return;
    }

    const requiredDocs = documents.filter((doc) => doc.is_required);
    const missingDocs = requiredDocs.filter((doc) => !doc.document_url);

    if (missingDocs.length > 0) {
      Burnt.toast({
        title: "Missing Documents",
        preset: "error",
        message: `Please upload the following required documents: ${missingDocs
          .map((doc) => doc.name)
          .join(", ")}`,
        haptic: "error",
        duration: 3,
        from: "top",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (userRole === "vendor") {
        const vendorDetails = user.vendorDetails;
        if (!vendorDetails?.vendor_id) {
          Burnt.toast({
            title: "Error",
            preset: "error",
            message: "Vendor information is missing",
            haptic: "error",
            duration: 3,
            from: "top",
          });
          return;
        }

        const vendorKycDocs: VendorKycDocument[] = documents
          .filter((doc) => doc.document_url)
          .map((doc) => ({
            document_type_id: doc.document_type_id,
            document_url: doc.document_url!,
            verification_status: "pending" as const,
          }));

        await vendorKycMutation.mutateAsync({
          vendorId: vendorDetails.vendor_id,
          documents: vendorKycDocs,
        });
      } else if (userRole === "delivery") {
        const deliveryDetails = user.deliveryDetails;
        if (!deliveryDetails?.partner_id) {
          Burnt.toast({
            title: "Error",
            preset: "error",
            message: "Delivery partner information is missing",
            haptic: "error",
            duration: 3,
            from: "top",
          });
          return;
        }

        const deliveryKycDocs: DeliveryKycDocument[] = documents
          .filter((doc) => doc.document_url)
          .map((doc) => ({
            document_type_id: doc.document_type_id,
            number: doc.document_number || "",
            link: doc.document_url!,
            verified: false,
          }));

        await deliveryKycMutation.mutateAsync({
          deliveryPartnerId: deliveryDetails.partner_id,
          documents: deliveryKycDocs,
        });
      } else {
        Burnt.toast({
          title: "Info",
          preset: "error",
          message: "KYC submission for this user type is not implemented yet",
          haptic: "none",
          duration: 3,
          from: "top",
        });
        return;
      }

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Failed to submit KYC:", error);
      Burnt.toast({
        title: "Submission Failed",
        preset: "error",
        message: error?.message || "Failed to submit documents. Please try again.",
        haptic: "error",
        duration: 3,
        from: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (entitiesLoading) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-muted-foreground">
            Loading document requirements...
          </Text>
        </View>
      );
    }

    if (entitiesError) {
      console.error("Entities error details:", entitiesError);
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-destructive text-center">
            Failed to load document requirements. Please try again.
          </Text>
        </View>
      );
    }

    if (documents.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-muted-foreground text-center">
            No documents required for verification at this time.
          </Text>
        </View>
      );
    }

    if (showSuccess) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Success!
          </Text>
          <Text className="text-base text-muted-foreground text-center px-4">
            Your documents have been submitted for verification. You will be notified once the review is complete.
          </Text>
        </View>
      );
    }

    // Delivery partner status checks
    const isDeliveryVerified = userRole === "delivery" && user?.deliveryDetails?.kyc?.verified;
    const isDeliveryPending = userRole === "delivery" && user?.deliveryDetails?.kyc?.verified === false &&
      user?.deliveryDetails?.kyc?.documents && user.deliveryDetails.kyc.documents.length > 0;
    const isDeliveryRejected = userRole === "delivery" && user?.deliveryDetails?.kyc?.verified === false &&
      user?.deliveryDetails?.kyc?.documents && user.deliveryDetails.kyc.documents.some((doc: any) => doc.rejection_reason);

    // Vendor status checks - prioritize document-level statuses
    const vendorDocuments = user?.vendorDetails?.verification_documents || [];
    const vendorStatus = user?.vendorDetails?.verification_status?.toLowerCase();
    
    // Check document-level statuses to determine actual state
    const hasPendingDocs = vendorDocuments.some((doc: any) => 
      doc.verification_status?.toLowerCase() === "pending"
    );
    const hasRejectedDocs = vendorDocuments.some((doc: any) => 
      doc.verification_status?.toLowerCase() === "rejected" && doc.rejection_reason
    );
    const allDocsApproved = vendorDocuments.length > 0 && vendorDocuments.every((doc: any) => 
      doc.verification_status?.toLowerCase() === "approved"
    );
    
    // Determine vendor verification state
    // If documents are pending (even if vendor status is rejected), show as pending (resubmitted)
    const isVendorVerified = userRole === "vendor" && (vendorStatus === "approved" || allDocsApproved);
    const isVendorPending = userRole === "vendor" && (
      hasPendingDocs || 
      (vendorStatus === "pending" && vendorDocuments.length > 0)
    );
    const isVendorRejected = userRole === "vendor" && (
      (vendorStatus === "rejected" && !hasPendingDocs && hasRejectedDocs) ||
      (hasRejectedDocs && !hasPendingDocs)
    );

    // Combined status checks
    const isVerified = isDeliveryVerified || isVendorVerified;
    const isPending = isDeliveryPending || isVendorPending;
    const isRejected = isDeliveryRejected || isVendorRejected;

    return (
      <ScrollView className="flex-1 pb-4">
        <Text className="text-base text-muted-foreground mb-6">
          {isVerified
            ? `Your ${userRole} account verification status and documents:`
            : isPending
            ? `Your ${userRole} account documents are under review. You can view your submitted documents below:`
            : isRejected
            ? `Your ${userRole} account documents have been rejected. Please review the feedback and resubmit your documents:`
            : `To ensure the security of our marketplace, we need to verify your identity. Please provide the following documents for your ${userRole} account:`}
        </Text>

        {documents.filter(doc => doc && doc.document_type_id).map((document) => {
          const docTypeId = String(document.document_type_id);
          const docName = String(document.name || "Document");
          const docDescription = document.description ? String(document.description) : null;
          const docNumber = document.document_number ? String(document.document_number) : "";
          const docUrl = document.document_url ? String(document.document_url) : "";

          // Find existing document for both delivery and vendor
          let existingDoc = null;
          let isDocumentVerified = false;
          let isDocumentPending = false;
          let isDocumentRejected = false;
          let rejectionReason = null;

          if (userRole === "delivery") {
            existingDoc = user?.deliveryDetails?.kyc?.documents?.find(
              (doc: any) => doc.document_type_id === docTypeId
            );
            isDocumentVerified = existingDoc?.verified;
            isDocumentRejected = !!existingDoc?.rejection_reason;
            rejectionReason = existingDoc?.rejection_reason;
          } else if (userRole === "vendor") {
            existingDoc = user?.vendorDetails?.verification_documents?.find(
              (doc: any) => doc.document_type_id === docTypeId
            );
            const docStatus = existingDoc?.verification_status?.toLowerCase();
            isDocumentVerified = docStatus === "approved";
            isDocumentPending = docStatus === "pending";
            isDocumentRejected = docStatus === "rejected" && !!existingDoc?.rejection_reason;
            rejectionReason = existingDoc?.rejection_reason;
          }

          return (
            <View key={docTypeId} className="mb-6">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm font-medium">{docName}</Text>
                {document.is_required && (
                  <Text className="text-xs text-destructive">*Required</Text>
                )}
                {isDocumentVerified && (
                  <Text className="text-xs text-green-600 font-medium">✓ Verified</Text>
                )}
                {(isPending || isDocumentPending) && !isDocumentVerified && docUrl && (
                  <Text className="text-xs text-yellow-600 font-medium">⏳ Under Review</Text>
                )}
                {isDocumentRejected && !isDocumentPending && (
                  <Text className="text-xs text-red-600 font-medium">❌ Rejected</Text>
                )}
              </View>

              {docDescription && (
                <Text className="text-xs text-muted-foreground mb-3">
                  {docDescription}
                </Text>
              )}

              {(userRole === "delivery" || userRole === "vendor") && (
                <Input
                  value={docNumber}
                  onChangeText={(value) =>
                    updateDocument(
                      docTypeId,
                      "document_number",
                      value
                    )
                  }
                  placeholder={`Enter ${docName} number`}
                  editable={!isSubmitting && !isVerified && !isPending}
                  className="mb-3"
                />
              )}

              {(isVerified || isPending) ? (
                <View className="mb-3">
                  <View className="p-3 rounded-lg border border-border bg-muted/50 mb-3">
                    <Text className="text-sm text-muted-foreground mb-2">
                      Document Status: {isDocumentVerified ? "✓ Verified" : (isPending || isDocumentPending) ? "⏳ Under Review" : "Not uploaded"}
                    </Text>
                    {docUrl && (
                      <Text className="text-xs text-muted-foreground">
                        Document uploaded successfully
                      </Text>
                    )}
                  </View>

                  {docUrl ? (
                    <TouchableOpacity
                      className="rounded-lg overflow-hidden border border-border"
                      style={{ height: 200 }}
                    >
                      <Image
                        source={{ uri: docUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ) : (isDocumentVerified || isPending || isDocumentPending) ? (
                    <View className="rounded-lg border border-border bg-muted/30 p-4 items-center justify-center" style={{ height: 200 }}>
                      <Text className="text-sm text-muted-foreground text-center">
                        Document {isDocumentVerified ? "verified" : "submitted"} but image not available
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : isRejected ? (
                <View className="mb-3">
                  {rejectionReason && (
                    <View className="p-3 rounded-lg border border-red-200 bg-red-50 mb-3">
                      <Text className="text-sm font-medium text-red-800 mb-1">
                        Rejection Reason:
                      </Text>
                      <Text className="text-sm text-red-700">
                        {rejectionReason}
                      </Text>
                    </View>
                  )}

                  {docUrl && (
                    <View className="mb-3">
                      <Text className="text-sm text-muted-foreground mb-2">
                        Previously submitted document:
                      </Text>
                      <TouchableOpacity
                        className="rounded-lg overflow-hidden border border-border"
                        style={{ height: 200 }}
                      >
                        <Image
                          source={{ uri: docUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  <FileUploader
                    value={docUrl || undefined}
                    onFileSelected={(url) =>
                      updateDocument(docTypeId, "document_url", String(url || ""))
                    }
                    onFileRemoved={() =>
                      updateDocument(docTypeId, "document_url", "")
                    }
                    placeholder={`Upload new ${docName}`}
                    disabled={isSubmitting}
                    acceptDocuments={true}
                    acceptImages={true}
                    maxFileSize={10}
                  />
                </View>
              ) : (
                <FileUploader
                  value={docUrl || undefined}
                  onFileSelected={(url) =>
                    updateDocument(docTypeId, "document_url", String(url || ""))
                  }
                  onFileRemoved={() =>
                    updateDocument(docTypeId, "document_url", "")
                  }
                  placeholder={`Upload ${docName}`}
                  disabled={isSubmitting}
                  acceptDocuments={true}
                  acceptImages={true}
                  maxFileSize={10}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const handleSuccessClose = async () => {
    try {
      // Give backend a moment to process the submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call onSuccess callback when closing after successful submission
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Error refreshing data after KYC submission:', error);
    } finally {
      onClose();
    }
  };

  const renderFooter = () => {
    // If showing success message, only show OK button
    if (showSuccess) {
      return (
        <View className="flex-row gap-3 justify-center">
          <Button 
            variant="primary" 
            className="flex-1" 
            onPress={handleSuccessClose}
          >
            <Text className="font-semibold text-primary-foreground">OK</Text>
          </Button>
        </View>
      );
    }

    const hasRequiredDocuments = documents
      .filter((doc) => doc.is_required)
      .every((doc) => doc.document_url);

    // Delivery partner status checks
    const isDeliveryVerified = userRole === "delivery" && user?.deliveryDetails?.kyc?.verified;
    const isDeliveryPending = userRole === "delivery" && user?.deliveryDetails?.kyc?.verified === false &&
      user?.deliveryDetails?.kyc?.documents && user.deliveryDetails.kyc.documents.length > 0;
    const isDeliveryRejected = userRole === "delivery" && user?.deliveryDetails?.kyc?.verified === false &&
      user?.deliveryDetails?.kyc?.documents && user.deliveryDetails.kyc.documents.some((doc: any) => doc.rejection_reason);

    // Vendor status checks (same logic as in renderContent)
    const vendorDocuments = user?.vendorDetails?.verification_documents || [];
    const vendorStatus = user?.vendorDetails?.verification_status?.toLowerCase();
    const hasPendingDocs = vendorDocuments.some((doc: any) => 
      doc.verification_status?.toLowerCase() === "pending"
    );
    const hasRejectedDocs = vendorDocuments.some((doc: any) => 
      doc.verification_status?.toLowerCase() === "rejected" && doc.rejection_reason
    );
    const allDocsApproved = vendorDocuments.length > 0 && vendorDocuments.every((doc: any) => 
      doc.verification_status?.toLowerCase() === "approved"
    );
    
    const isVendorVerified = userRole === "vendor" && (vendorStatus === "approved" || allDocsApproved);
    const isVendorPending = userRole === "vendor" && (
      hasPendingDocs || 
      (vendorStatus === "pending" && vendorDocuments.length > 0)
    );
    const isVendorRejected = userRole === "vendor" && (
      (vendorStatus === "rejected" && !hasPendingDocs && hasRejectedDocs) ||
      (hasRejectedDocs && !hasPendingDocs)
    );

    // Combined checks
    const isVerified = isDeliveryVerified || isVendorVerified;
    const isPending = isDeliveryPending || isVendorPending;
    const isRejected = isDeliveryRejected || isVendorRejected;

    if (isVerified || isPending) {
      return (
        <View className="flex-row gap-3 justify-center">
          <Button variant="outline" className="flex-1" onPress={onClose}>
            <Text className="font-semibold text-foreground">Close</Text>
          </Button>
        </View>
      );
    }

    if (isRejected) {
      return (
        <View className="flex-row gap-3 justify-between">
          <Button variant="outline" className="flex-1" onPress={onClose} disabled={isSubmitting}>
            <Text className="font-semibold text-foreground">Cancel</Text>
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            disabled={
              !hasRequiredDocuments || isSubmitting || documents.length === 0
            }
            onPress={handleSubmit}
          >
            <Text className="text-foreground font-semibold">
              {isSubmitting ? "Resubmitting..." : "Resubmit Documents"}
            </Text>
          </Button>
        </View>
      );
    }

    return (
      <View className="flex-row gap-3 justify-between">
        <Button variant="outline" className="flex-1" onPress={onClose} disabled={isSubmitting}>
          <Text className="font-semibold text-foreground">Skip for Now</Text>
        </Button>

        <Button
          variant="primary"
          className="flex-1"
          disabled={
            !hasRequiredDocuments || isSubmitting || documents.length === 0
          }
          onPress={handleSubmit}
        >
          <Text className="text-foreground font-semibold">
            {isSubmitting ? "Submitting..." : "Submit Documents"}
          </Text>
        </Button>
      </View>
    );
  };

  // Guard clauses for rendering
  if (!userRole || !["vendor", "delivery"].includes(userRole)) {
    return null;
  }

  if (!tenantId) {
    console.error("KYC Modal: Missing tenant ID");
    return null;
  }

  if (userRole === "vendor") {
    const hasVendorDetails = user?.vendorDetails && typeof user.vendorDetails === 'object';
    const verificationStatus = hasVendorDetails ? user.vendorDetails.verification_status : null;

    if (!hasVendorDetails) {
      console.error("KYC Modal: Missing vendor details");
      return null;
    }

    if (verificationStatus && verificationStatus.toLowerCase() === "approved") {
      console.log("KYC Modal: Vendor KYC already approved, continuing to render status");
    }
  }

  if (userRole === "delivery") {
    const hasDeliveryDetails = user?.deliveryDetails && typeof user.deliveryDetails === 'object';
    const isDeliveryVerified = hasDeliveryDetails && user.deliveryDetails.kyc?.verified === true;

    if (!hasDeliveryDetails) {
      console.error("KYC Modal: Missing delivery details");
      return null;
    }

    if (isDeliveryVerified) {
      console.log("KYC Modal: Delivery KYC already verified, continuing to render status");
    }
  }

  if (entitiesError) {
    console.error("KYC Modal: Entities error, not showing modal:", entitiesError);
    return null;
  }

  if (entitiesLoading) {
    console.log("KYC Modal: Entities loading, not rendering");
    return null;
  }

  if (!entitiesData || !entitiesData.items || entitiesData.items.length === 0) {
    console.error("KYC Modal: No entities data available");
    return null;
  }

  const currentEntity = entitiesData.items.find(
    (entity) => entity && entity.name && entity.name.toLowerCase() === userRole.toLowerCase()
  );
  if (!currentEntity) {
    console.error("KYC Modal: No matching entity found for role", userRole);
    return null;
  }

  try {
    return (
      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={onClose}
        title={`Verify Your ${
          userRole.charAt(0).toUpperCase() + userRole.slice(1)
        } Account`}
        snapPoints={["90%"]}
        footer={renderFooter()}
      >
        {renderContent()}
      </ResponsiveModal>
    );
  } catch (error) {
    console.error("KYC Modal render error:", error);
    return null;
  }
}
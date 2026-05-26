import { View, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table } from "@/components/ui/Table";
import { useGetVendorRequests } from "@/services/affiliates";
import { AffiliateRequestResponse } from "@/services/types/affiliates";
import { AffiliateRequestDetailsModal } from "@/components/modals/AffiliateRequestDetailsModal";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Store, 
  Package, 
  MessageSquare,
  Eye,
  Calendar
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";

interface AffiliateRequestsProps {
  vendorId: string;
}

export function AffiliateRequests({ vendorId }: AffiliateRequestsProps) {
  const { isDesktop } = useResponsive();
  const resolvedColors = useResolvedThemeColors();
  const [filter, setFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<AffiliateRequestResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useGetVendorRequests(
    {
      vendor_id: vendorId,
      status: filter,
      limit: 50,
    },
    !!vendorId
  );

  const handleRequestPress = (request: AffiliateRequestResponse) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestUpdate = () => {
    refetch();
  };

  const getFilterCounts = () => {
    const pending = requestsData?.requests?.filter(r => r.status === "pending").length || 0;
    const approved = requestsData?.requests?.filter(r => r.status === "approved").length || 0;
    const rejected = requestsData?.requests?.filter(r => r.status === "rejected").length || 0;
    return { pending, approved, rejected };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 80) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle size={isDesktop ? 20 : 16} className="text-green-500" />;
      case "rejected":
        return <XCircle size={isDesktop ? 20 : 16} className="text-red-500" />;
      case "pending":
        return <Clock size={isDesktop ? 20 : 16} className="text-yellow-500" />;
      default:
        return <Clock size={isDesktop ? 20 : 16} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-400 text-green-800";
      case "rejected":
        return "bg-red-400 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const requestColumns = [
    {
      header: "Type",
      accessor: "request_type",
      render: (value: string) => (
        <View className="flex-row items-center gap-2">
          {value === "vendor" ? (
            <Store size={isDesktop ? 20 : 16} className="text-primary" />
          ) : (
            <Package size={isDesktop ? 20 : 16} className="text-primary" />
          )}
          <Text className={`text-sm ${isDesktop ? 'text-sm' : ''}`}>
            {value === "vendor" ? "Store Partnership" : "Product Partnership"}
          </Text>
        </View>
      ),
    },
    {
      header: "Affiliate",
      accessor: "affiliate_id",
      render: (value: string) => (
        <View className="flex-row items-center gap-2">
          <User size={isDesktop ? 16 : 12} className="text-muted-foreground" />
          <Text className={`text-sm ${isDesktop ? 'text-sm' : ''}`}>
            {value}
          </Text>
        </View>
      ),
    },
    {
      header: "Message",
      accessor: "message",
      render: (value: string) => (
        <Text className={`text-sm ${isDesktop ? 'text-sm' : ''}`}>
          {truncateMessage(value)}
        </Text>
      ),
    },
    {
      header: "Commission",
      accessor: "commission_rate",
      render: (value: number | null) =>
        value ? (
          <Badge variant="outline">
            <Text className={`text-xs font-semibold text-primary ${isDesktop ? 'text-sm' : ''}`}>
              {value}%
            </Text>
          </Badge>
        ) : (
          <Text className={`text-sm text-muted-foreground ${isDesktop ? 'text-sm' : ''}`}>
            N/A
          </Text>
        ),
    },
    {
      header: "Date",
      accessor: "created_at",
      render: (value: string) => (
        <Text className={`text-sm ${isDesktop ? 'text-sm' : ''}`}>
          {formatDate(value)}
        </Text>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => (
        <View className="flex-row items-center gap-2">
          {getStatusIcon(value)}
          <Badge className={`${getStatusColor(value)} ${isDesktop ? 'px-3 py-1' : ''}`}>
            <Text className={`text-xs font-semibold capitalize ${isDesktop ? 'text-sm' : ''}`}>
              {value}
            </Text>
          </Badge>
        </View>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (_: any, request: AffiliateRequestResponse) => (
        <Button
          variant="outline"
          size="icon"
          onPress={() => handleRequestPress(request)}
        >
          <Eye size={isDesktop ? 20 : 16} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        </Button>
      ),
    },
  ];

  const counts = getFilterCounts();

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center p-4 ${isDesktop ? 'px-16 py-10' : ''}`}>
        <Text className="text-muted-foreground">
          Loading affiliate requests...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`flex-1 justify-center items-center p-4 ${isDesktop ? 'px-16 py-10' : ''}`}>
        <Text className="text-destructive mb-4">Failed to load requests</Text>
        <Button onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-background ${isDesktop ? 'mx-16 mt-10' : ''}`} edges={["top", "left", "right"]}>
      <View className="px-4 border-b border-border">
        <Text className={`text-xl font-bold text-foreground mb-4 ${isDesktop ? 'text-2xl' : ''}`}>
          Affiliate Requests
        </Text>
        <Text className={`text-sm text-muted-foreground mb-4 ${isDesktop ? 'text-base' : ''}`}>
          Review and manage partnership requests from affiliates
        </Text>

        <View className={`flex-row gap-2 pb-2 ${isDesktop ? 'gap-4 mb-6' : ''}`}>
          <Button
            variant={filter === "pending" ? "primary" : "outline"}
            size={isDesktop ? "default" : "sm"}
            onPress={() => setFilter("pending")}
          >
            <Text
              className={`font-semibold ${
                filter === "pending" ? "text-white" : "text-foreground"
              } ${isDesktop ? 'text-base' : ''}`}
            >
              Pending {counts.pending > 0 && `(${counts.pending})`}
            </Text>
          </Button>
          <Button
            variant={filter === "approved" ? "primary" : "outline"}
            size={isDesktop ? "default" : "sm"}
            onPress={() => setFilter("approved")}
          >
            <Text
              className={`font-semibold ${
                filter === "approved" ? "text-white" : "text-foreground"
              } ${isDesktop ? 'text-base' : ''}`}
            >
              Approved {counts.approved > 0 && `(${counts.approved})`}
            </Text>
          </Button>
          <Button
            variant={filter === "rejected" ? "primary" : "outline"}
            size={isDesktop ? "default" : "sm"}
            onPress={() => setFilter("rejected")}
          >
            <Text
              className={`font-semibold ${
                filter === "rejected" ? "text-white" : "text-foreground"
              } ${isDesktop ? 'text-base' : ''}`}
            >
              Rejected {counts.rejected > 0 && `(${counts.rejected})`}
            </Text>
          </Button>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {isDesktop ? (
          <View className="flex-1 ">
            {requestsData?.requests?.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <View className="w-24 h-24 bg-muted rounded-full items-center justify-center mb-4">
                  <MessageSquare size={40} className="text-muted-foreground" />
                </View>
                <Text className="text-xl font-semibold text-foreground mb-2">
                  No {filter} requests
                </Text>
                <Text className="text-base text-muted-foreground text-center max-w-md">
                  {filter === "pending" 
                    ? "You don't have any pending affiliate requests at the moment."
                    : `No ${filter} requests found.`}
                </Text>
              </View>
            ) : (
              <Table
                columns={requestColumns}
                data={requestsData?.requests || []}
                ariaLabelledBy="affiliate-requests-table"
              />
            )}
          </View>
        ) : (
          <ScrollView className="flex-1 p-4">
            {requestsData?.requests?.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <View className="w-20 h-20 bg-muted rounded-full items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-muted-foreground" />
                </View>
                <Text className="text-lg font-semibold text-foreground mb-2">
                  No {filter} requests
                </Text>
                <Text className="text-sm text-muted-foreground text-center">
                  {filter === "pending" 
                    ? "You don't have any pending affiliate requests at the moment."
                    : `No ${filter} requests found.`}
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {requestsData?.requests?.map((request) => (
                  <TouchableOpacity key={request.id} onPress={() => handleRequestPress(request)} activeOpacity={0.7}>
                    <Card className="p-4 border-l-4 border-l-primary">
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            {request.request_type === "vendor" ? (
                              <Store size={16} className="text-primary" />
                            ) : (
                              <Package size={16} className="text-primary" />
                            )}
                            <Text className="text-lg font-semibold text-foreground">
                              {request.request_type === "vendor"
                                ? "Store Partnership"
                                : "Product Partnership"}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <User size={12} className="text-muted-foreground" />
                            <Text className="text-sm text-muted-foreground">
                              {request.affiliate_id.slice(0, 8)}...
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusColor(request.status)}>
                            <Text className="text-xs font-semibold capitalize">
                              {request.status}
                            </Text>
                          </Badge>
                        </View>
                      </View>

                      <View className="mb-3">
                        <Text className="text-sm text-foreground leading-5">
                          {truncateMessage(request.message)}
                        </Text>
                      </View>

                      {request.commission_rate && (
                        <View className="flex-row items-center gap-2 mb-3">
                          <Text className="text-sm font-medium text-foreground">
                            Proposed Commission:
                          </Text>
                          <Badge variant="outline">
                            <Text className="text-xs font-semibold text-primary">
                              {request.commission_rate}%
                            </Text>
                          </Badge>
                        </View>
                      )}

                      <Separator className="mb-3" />

                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                          <Calendar size={12} className="text-muted-foreground" />
                          <Text className="text-xs text-muted-foreground">
                            {formatDate(request.created_at)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Eye size={12} className="text-muted-foreground" color={resolvedColors?.foreground || "#000000"} />
                          <Text className="text-xs text-muted-foreground">
                            View Details
                          </Text>
                        </View>
                      </View>

                      {request.status === "pending" && (
                        <View className="mt-3 pt-3 border-t border-border">
                          <Text className="text-xs text-primary font-medium">
                            Action Required • Tap to review and respond
                          </Text>
                        </View>
                      )}
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <AffiliateRequestDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        request={selectedRequest}
        onRequestUpdate={handleRequestUpdate}
      />
    </SafeAreaView>
  );
}
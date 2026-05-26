import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  X,
  ExternalLink,
  Eye,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useGetOrders } from "@/services/orders";
import { useCreateTicket } from "@/services/support";
import { useI18n } from "@/hooks/useI18n";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  type Option,
} from "@/components/ui/select";
import { Terminal } from "@/lib/icons/Terminal";
import type { Order } from "@/services/types/orders";
import { OrdersListSkeleton } from "@/components/ui/skeleton";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import * as Burnt from "burnt";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface TicketFormData {
  subject: string;
  initial_message: string;
  category: string;
  priority: string;
  vendor_id: string;
  order_id: string;
}

const OrdersScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const createTicketMutation = useCreateTicket();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Option>({
    value: "all",
    label: t("orders.all_status"),
  });
  const [paymentFilter, setPaymentFilter] = useState<Option>({
    value: "all",
    label: t("orders.all_payments"),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketFormData>({
    subject: "",
    initial_message: "",
    category: "order",
    priority: "medium",
    vendor_id: "",
    order_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedThemeColors = useResolvedThemeColors();

  usePageTitle("Orders");

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useGetOrders(
    {
      user_id: user?.user_id,
      status: statusFilter?.value !== "all" ? statusFilter?.value : undefined,
      payment_status:
        paymentFilter?.value !== "all" ? paymentFilter?.value : undefined,
      limit: 50,
    },
    !!user?.user_id
  );

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) {
        refetch();
      }
    }, [user?.user_id, refetch])
  );

  useEffect(() => {
    if (user?.user_id && !isLoading && !ordersData) {
      refetch();
    }
  }, [user?.user_id, isLoading, ordersData, refetch]);

  const onRefresh = useCallback(async () => {
    if (!user?.user_id) return;

    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.user_id, refetch]);

  const ordersArray = Array.isArray(ordersData)
    ? ordersData
    : ordersData?.items || [];
  const filteredOrders = ordersArray.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for opening the ticket dialog
  const handleOpenTicketDialog = (order: Order) => {
    const firstVendorId = order.items && order.items.length > 0
      ? order.items[0].vendor_id
      : "";

    setTicketForm({
      subject: "",
      initial_message: "",
      category: "order",
      priority: "medium",
      vendor_id: firstVendorId,
      order_id: order.order_id,
    });
    setShowTicketDialog(true);
  };

  // Handler for submitting the ticket
  const handleSubmitTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.initial_message.trim()) {
      Burnt.toast({
        title: t("orders.invalid_input"),
        preset: "error",
        message: t("orders.fill_subject_message"),
        haptic: "error",
        duration: 3,
        from: "top",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicketMutation.mutateAsync(ticketForm);
      Burnt.toast({
        title: t("orders.ticket_created"),
        preset: "done",
        message: t("orders.ticket_created_success"),
        haptic: "success",
        duration: 2,
        from: "top",
      });
      setShowTicketDialog(false);
      setTicketForm({
        subject: "",
        initial_message: "",
        category: "order",
        priority: "medium",
        vendor_id: "",
        order_id: "",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      Burnt.toast({
        title: t("orders.error_creating_ticket"),
        preset: "error",
        message: t("orders.failed_create_ticket"),
        haptic: "error",
        duration: 3,
        from: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock size={16} color={resolvedThemeColors?.warning} className="text-warning" />;
      case "processing":
        return <Package size={16} className="text-primary" />;
      case "completed":
      case "delivered":
        return <CheckCircle2 size={16} className="text-success" />;
      case "cancelled":
      case "failed":
        return <XCircle size={16} className="text-destructive" />;
      default:
        return <Package size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusVariant = (
    status: string
  ): "success" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "success";
      case "pending":
      case "processing":
      case "confirmed":
        return "outline";
      case "cancelled":
      case "failed":
        return "destructive";
      case "refunded":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "TZS") => {
    if (currency === "TZS") {
      return `TSh ${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter({ value: "all", label: t("orders.all_status") });
    setPaymentFilter({ value: "all", label: t("orders.all_payments") });
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter?.value !== "all" ||
    paymentFilter?.value !== "all";

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="p-4">
          <Text className="text-2xl font-bold text-foreground mb-6">
            {t("orders.my_orders")}
          </Text>
          <View className="flex-1 items-center justify-center py-16">
            <Package size={64} className="text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t("orders.please_login_to_view")}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !refreshing) {
    if (isDesktop) {
      return (
        <DesktopLayoutWrapper
          showSidebar={false}
          showNavBar={true}
          showFooter={false}
          containerClassName="bg-white"
        >
          <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
            <View className="w-full bg-background p-6">
              {/* Header with Filters - Keep visible during loading */}
              <View className="mb-6">
                <Text className="text-3xl font-bold text-foreground mb-6">
                  {t("orders.my_orders")}
                </Text>

                <View className="flex-row items-center justify-between gap-4 mb-4">
                  <View className="w-96">
                    <Input
                      placeholder={t("orders.search_by_order_number")}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      className="border border-border"
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <View className="w-48">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="text-foreground bg-muted">
                          <SelectValue placeholder={t("orders.order_status")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" label={t("orders.all_status")} />
                          <SelectItem value="pending" label={t("orders.pending")} />
                          <SelectItem value="processing" label={t("orders.processing")} />
                          <SelectItem value="completed" label={t("orders.completed")} />
                          <SelectItem value="cancelled" label={t("orders.cancelled")} />
                        </SelectContent>
                      </Select>
                    </View>

                    <View className="w-48">
                      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="text-foreground bg-muted">
                          <SelectValue placeholder={t("orders.payment_status")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" label={t("orders.all_payments")} />
                          <SelectItem value="pending" label={t("orders.pending")} />
                          <SelectItem value="paid" label={t("orders.paid")} />
                          <SelectItem value="failed" label={t("orders.failed")} />
                          <SelectItem value="refunded" label={t("orders.refunded")} />
                        </SelectContent>
                      </Select>
                    </View>

                    {hasActiveFilters && (
                      <Button variant="outline" onPress={resetFilters}>
                        <Text>{t("orders.clear_filters")}</Text>
                      </Button>
                    )}
                  </View>
                </View>

                <Text className="text-sm text-muted-foreground">
                  {t("orders.loading_orders")}
                </Text>
              </View>

              {/* Table Skeleton */}
              <View className="w-full bg-white rounded-lg border border-border overflow-hidden">
                {/* Table Header Skeleton */}
                <View className="flex-row bg-muted border-b border-border py-3 px-4">
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="flex-1 h-4 bg-muted-foreground/20 rounded mr-4" />
                  <View className="w-32 h-4 bg-muted-foreground/20 rounded" />
                </View>

                {/* Table Rows Skeleton */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <View key={i} className="flex-row items-center border-b border-border py-4 px-4">
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="flex-1 h-4 bg-muted rounded mr-4" />
                    <View className="w-32 h-4 bg-muted rounded" />
                  </View>
                ))}
              </View>
            </View>
          </SafeAreaView>
        </DesktopLayoutWrapper>
      );
    }

    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <OrdersListSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#666"
              title="Pull to refresh"
              titleColor="#666"
            />
          }
        >
          <View className="p-4">
            <Text className="text-2xl font-bold text-foreground mb-6">
              {t("orders.my_orders")}
            </Text>
            <Alert icon={Terminal} variant="destructive">
              <Text className="text-sm text-destructive">
                {t("orders.failed_to_load_orders")}
              </Text>
            </Alert>
            <Button variant="outline" onPress={() => refetch()} className="mt-4">
              <Text>{t("orders.retry")}</Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Desktop Table View
  if (isDesktop) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={false}
        containerClassName="bg-white"
      >
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          <View className="w-full bg-background p-6">
            {/* Header with Filters */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-foreground mb-6">
                {t("orders.my_orders")}
              </Text>

              <View className="flex-row items-center justify-between gap-4 mb-4">
                <View className="w-96">
                  <Input
                    placeholder={t("orders.search_by_order_number")}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="border border-border"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="text-foreground bg-muted">
                        <SelectValue placeholder={t("orders.order_status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" label={t("orders.all_status")} />
                        <SelectItem value="pending" label={t("orders.pending")} />
                        <SelectItem value="processing" label={t("orders.processing")} />
                        <SelectItem value="completed" label={t("orders.completed")} />
                        <SelectItem value="cancelled" label={t("orders.cancelled")} />
                      </SelectContent>
                    </Select>
                  </View>

                  <View className="w-48">
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="text-foreground bg-muted">
                        <SelectValue placeholder={t("orders.payment_status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" label={t("orders.all_payments")} />
                        <SelectItem value="pending" label={t("orders.pending")} />
                        <SelectItem value="paid" label={t("orders.paid")} />
                        <SelectItem value="failed" label={t("orders.failed")} />
                        <SelectItem value="refunded" label={t("orders.refunded")} />
                      </SelectContent>
                    </Select>
                  </View>

                  {hasActiveFilters && (
                    <Button variant="outline" onPress={resetFilters}>
                      <Text>{t("orders.clear_filters")}</Text>
                    </Button>
                  )}
                </View>
              </View>

              <Text className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? t("orders.showing_filtered_results", { count: filteredOrders.length })
                  : t("orders.showing_all_orders", { count: ordersArray.length })}
              </Text>
            </View>

            {/* Orders Table */}
            <View className="w-full bg-white rounded-lg border border-border overflow-hidden">
              {/* Table Header */}
              <View className="flex-row bg-muted border-b border-border py-3 px-4">
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.order")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.date")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.customer")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.payment")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.total")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.delivery")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.items")}
                </Text>
                <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.fulfillment")}
                </Text>
                <Text className="w-32 text-xs font-semibold text-muted-foreground uppercase">
                  {t("orders.action")}
                </Text>
              </View>

              {/* Table Body */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="max-h-[600px]"
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#666"
                  />
                }
              >
                {filteredOrders.length === 0 ? (
                  <View className="flex-1 items-center justify-center py-16">
                    <Package size={64} className="text-muted-foreground mb-4" />
                    <Text className="text-lg font-semibold text-foreground mb-2">
                      {hasActiveFilters
                        ? t("orders.no_orders_match_filters")
                        : t("orders.no_orders_yet")}
                    </Text>
                    <Text className="text-muted-foreground text-center mb-6">
                      {hasActiveFilters
                        ? t("orders.try_adjusting_filters")
                        : t("orders.start_shopping")}
                    </Text>
                  </View>
                ) : (
                  filteredOrders.map((order: Order) => {
                    if (!order || !order.order_id || !order.totals) {
                      return null;
                    }

                    return (
                      <View
                        key={order.order_id}
                        className="flex-row items-center border-b border-border py-4 px-4 hover:bg-muted/50"
                      >
                        {/* Order Number */}
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-foreground">
                            #{order.order_number}
                          </Text>
                        </View>

                        {/* Date */}
                        <View className="flex-1">
                          <Text className="text-sm text-foreground">
                            {formatDate(order.created_at)}
                          </Text>
                        </View>

                        {/* Customer (User Name) */}
                        <View className="flex-1">
                          <Text className="text-sm text-foreground">
                            {user?.name || "N/A"}
                          </Text>
                        </View>

                        {/* Payment Status */}
                        <View className="flex-1">
                          <View className="inline-flex self-start">
                            <Badge
                              variant={
                                order.payment_status.toLowerCase() === "paid"
                                  ? "success"
                                  : order.payment_status.toLowerCase() === "failed"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              <Text className="text-xs capitalize">
                                {order.payment_status}
                              </Text>
                            </Badge>
                          </View>
                        </View>

                        {/* Total */}
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {formatCurrency(order.totals.total, order.currency)}
                          </Text>
                        </View>

                        {/* Delivery Status */}
                        <View className="flex-1">
                          <Text className="text-sm text-muted-foreground">
                            N/A
                          </Text>
                        </View>

                        {/* Items Count */}
                        <View className="flex-1">
                          <Text className="text-sm text-foreground">
                            {order.items?.length || 0} items
                          </Text>
                        </View>

                        {/* Fulfillment Status */}
                        <View className="flex-1">
                          <View className="inline-flex self-start">
                            <Badge variant={getStatusVariant(order.status)}>
                              <Text className="text-xs capitalize">
                                {order.status}
                              </Text>
                            </Badge>
                          </View>
                        </View>

                        {/* Actions */}
                        <View className="w-32 flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => router.push(`/orders/${order.order_id}`)}
                            className="p-2 rounded hover:bg-muted"
                          >
                            <Eye size={18} className="text-foreground" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleOpenTicketDialog(order)}
                            className="p-2 rounded hover:bg-muted"
                          >
                            <MessageSquare size={18} className="text-foreground" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>

          {/* Ticket Creation Dialog */}
          <Modal
            visible={showTicketDialog}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTicketDialog(false)}
          >
            <View className="flex-1 bg-black/50 items-center justify-center p-4">
              <Card className="w-full max-w-lg bg-card p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-foreground">
                    {t("orders.raise_support_ticket")}
                  </Text>
                  <TouchableOpacity onPress={() => setShowTicketDialog(false)}>
                    <X size={24} className="text-muted-foreground" />
                  </TouchableOpacity>
                </View>

                <ScrollView className="max-h-96">
                  <View className="gap-4">
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        {t("orders.subject")} *
                      </Text>
                      <Input
                        placeholder={t("orders.brief_description")}
                        value={ticketForm.subject}
                        onChangeText={(text) =>
                          setTicketForm({ ...ticketForm, subject: text })
                        }
                        className="border border-border"
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        {t("orders.message")} *
                      </Text>
                      <Input
                        placeholder={t("orders.detailed_description")}
                        value={ticketForm.initial_message}
                        onChangeText={(text) =>
                          setTicketForm({ ...ticketForm, initial_message: text })
                        }
                        multiline
                        numberOfLines={4}
                        className="border border-border h-24"
                        style={{ textAlignVertical: 'top' }}
                      />
                    </View>

                    <View className="bg-muted p-3 rounded-lg">
                      <Text className="text-xs text-muted-foreground mb-2">
                        {t("orders.ticket_information")}
                      </Text>
                      <View className="gap-1">
                        <Text className="text-xs text-foreground">
                          {t("orders.category")}: <Text className="font-semibold">{t("orders.order")}</Text>
                        </Text>
                        <Text className="text-xs text-foreground">
                          {t("orders.priority")}: <Text className="font-semibold">{t("orders.medium")}</Text>
                        </Text>
                        <Text className="text-xs text-foreground">
                          {t("orders.order")} ID: <Text className="font-semibold">{ticketForm.order_id}</Text>
                        </Text>
                        {ticketForm.vendor_id && (
                          <Text className="text-xs text-foreground">
                            {t("orders.vendor_id")}: <Text className="font-semibold">{ticketForm.vendor_id}</Text>
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View className="flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    onPress={() => setShowTicketDialog(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Text>{t("common.cancel")}</Text>
                  </Button>
                  <Button
                    onPress={handleSubmitTicket}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Text className="text-white">
                      {isSubmitting ? t("orders.submitting") : t("orders.submit_ticket")}
                    </Text>
                  </Button>
                </View>
              </Card>
            </View>
          </Modal>
        </SafeAreaView>
      </DesktopLayoutWrapper>
    );
  }

  // Mobile View (Original Design)
  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={false}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="bg-background p-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-foreground">
              {t("orders.my_orders")}
            </Text>
            {refreshing && (
              <View className="flex-row items-center">
                <Text className="text-sm text-muted-foreground mr-2">{t("orders.refreshing")}</Text>
              </View>
            )}
          </View>

          <View className="gap-4">
            <View className="flex-row items-center bg-background rounded-lg">
              <Input
                placeholder={t("orders.search_by_order_number")}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 border-0 bg-transparent"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-foreground bg-muted">
                    <SelectValue placeholder={t("orders.order_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" label={t("orders.all_status")} />
                    <SelectItem value="pending" label={t("orders.pending")} />
                    <SelectItem value="processing" label={t("orders.processing")} />
                    <SelectItem value="completed" label={t("orders.completed")} />
                    <SelectItem value="cancelled" label={t("orders.cancelled")} />
                  </SelectContent>
                </Select>
              </View>

              <View className="flex-1">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="text-foreground bg-muted">
                    <SelectValue placeholder={t("orders.payment_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" label={t("orders.all_payments")} />
                    <SelectItem value="pending" label={t("orders.pending")} />
                    <SelectItem value="paid" label={t("orders.paid")} />
                    <SelectItem value="failed" label={t("orders.failed")} />
                    <SelectItem value="refunded" label={t("orders.refunded")} />
                  </SelectContent>
                </Select>
              </View>
            </View>

            {hasActiveFilters && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("orders.showing_filtered_results", { count: filteredOrders.length })}
                </Text>
                <Button variant="outline" onPress={resetFilters}>
                  <Text>{t("orders.clear_filters")}</Text>
                </Button>
              </View>
            )}

            {!hasActiveFilters && ordersArray.length > 0 && (
              <Text className="text-sm text-muted-foreground">
                {t("orders.showing_all_orders", { count: ordersArray.length })}
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          className="bg-background px-4 flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#666"
              title="Pull to refresh"
              titleColor="#666"
            />
          }
        >
          {filteredOrders.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <Package size={64} className="text-muted-foreground mb-4" color={resolvedThemeColors?.primary} />
              <Text className="text-lg font-semibold text-foreground mb-2">
                {hasActiveFilters
                  ? t("orders.no_orders_match_filters")
                  : t("orders.no_orders_yet")}
              </Text>
              <Text className="text-muted-foreground text-center mb-6">
                {hasActiveFilters
                  ? t("orders.try_adjusting_filters")
                  : t("orders.start_shopping")}
              </Text>
              {hasActiveFilters ? (
                <Button variant="outline" onPress={resetFilters}>
                  <Text>{t("orders.clear_all_filters")}</Text>
                </Button>
              ) : (
                <Button onPress={() => router.push("/")}>
                  <Text className="text-white">{t("orders.start_shopping_button")}</Text>
                </Button>
              )}
            </View>
          ) : (
            <View className="gap-4 pb-6">
              {filteredOrders.map((order: Order) => {
                if (!order || !order.order_id || !order.totals) {
                  console.warn("Incomplete order data:", order);
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={order.order_id}
                    onPress={() => router.push(`/orders/${order.order_id}`)}
                  >
                    <Card className="p-4">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground mb-1">
                            Order #{order.order_number}
                          </Text>
                          <Text className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <View className="flex-row items-center mb-1">
                            <Badge
                              variant={getStatusVariant(order.status)}
                              className="ml-1"
                            >
                              <Text className="text-xs text-accent">
                                {order.status}
                              </Text>
                            </Badge>
                          </View>
                          <Text className="text-sm font-semibold text-success">
                            {formatCurrency(order.totals.total, order.currency)}
                          </Text>
                        </View>
                      </View>

                      <View className="border-t border-border pt-3">
                        <Text className="text-sm text-muted-foreground mb-2">
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) !== 1 ? "s" : ""}
                        </Text>

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text className="text-xs text-muted-foreground mr-2">
                              Payment:
                            </Text>
                            <Badge
                              variant={
                                (order.payment_status.toLowerCase()) === "paid"
                                  ? "success" :
                                  (order.payment_status.toLowerCase()) === "failed"
                                    ? "destructive" :
                                    "secondary"
                              }
                            >
                              <Text className="text-xs text-accent">
                                {order.payment_status.toUpperCase()}
                              </Text>
                            </Badge>
                          </View>

                          <Text className="text-xs text-primary font-medium">
                            View Details →
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Ticket Creation Dialog */}
        <Modal
          visible={showTicketDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTicketDialog(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-card p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">
                  Raise a Support Ticket
                </Text>
                <TouchableOpacity onPress={() => setShowTicketDialog(false)}>
                  <X size={24} className="text-muted-foreground" />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Subject *
                    </Text>
                    <Input
                      placeholder="Brief description of the issue"
                      value={ticketForm.subject}
                      onChangeText={(text) =>
                        setTicketForm({ ...ticketForm, subject: text })
                      }
                      className="border border-border"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Message *
                    </Text>
                    <Input
                      placeholder="Detailed description of your issue"
                      value={ticketForm.initial_message}
                      onChangeText={(text) =>
                        setTicketForm({ ...ticketForm, initial_message: text })
                      }
                      multiline
                      numberOfLines={4}
                      className="border border-border h-24"
                      style={{ textAlignVertical: 'top' }}
                    />
                  </View>

                  {/* <View className="bg-muted p-3 rounded-lg">
                    <Text className="text-xs text-muted-foreground mb-2">
                      Ticket Information:
                    </Text>
                    <View className="gap-1">
                      <Text className="text-xs text-foreground">
                        Category: <Text className="font-semibold">Order</Text>
                      </Text>

                      <Text className="text-xs text-foreground">
                        Order ID: <Text className="font-semibold">{ticketForm.order_id}</Text>
                      </Text>
                      {ticketForm.vendor_id && (
                        <Text className="text-xs text-foreground">
                          Vendor ID: <Text className="font-semibold">{ticketForm.vendor_id}</Text>
                        </Text>
                      )}
                    </View>
                  </View> */}
                </View>
              </ScrollView>

              <View className="flex-row gap-3 mt-6">
                <Button
                  variant="outline"
                  onPress={() => setShowTicketDialog(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Text>Cancel</Text>
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSubmitTicket}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Text className="text-primary">
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Text>
                </Button>
              </View>
            </Card>
          </View>
        </Modal>
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
};

export default OrdersScreen;
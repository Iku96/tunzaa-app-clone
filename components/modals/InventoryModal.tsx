import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { ArrowUp01Icon } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { ProductResponse } from "@/services/product-management";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface InventoryModalProps {
  product?: ProductResponse;
  onSubmit: (productId: string, newQuantity: number, basePrice?: number, salePrice?: number) => void;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "primary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function InventoryModal({
  product,
  onSubmit,
  triggerText,
  triggerVariant = "secondary",
  triggerSize = "icon",
  disabled = false,
}: InventoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      setNewQuantity(product.inventory_quantity.toString());
      setBasePrice(product.base_price.toString());
      setSalePrice(product.sale_price.toString());
    }
  }, [isOpen, product]);

  const handleOpen = () => {
    if (product) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!product || !newQuantity || isNaN(Number(newQuantity))) return;

    const quantity = Number(newQuantity);
    if (quantity < 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        product.product_id,
        quantity,
        basePrice ? Number(basePrice) : undefined,
        salePrice ? Number(salePrice) : undefined
      );
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAdjustmentInfo = () => {
    if (!product || !newQuantity || isNaN(Number(newQuantity))) {
      return { difference: 0, type: "none" };
    }

    const current = product.inventory_quantity;
    const newQty = Number(newQuantity);
    const difference = newQty - current;

    return {
      difference: Math.abs(difference),
      type: difference > 0 ? "addition" : difference < 0 ? "reduction" : "none",
    };
  };

  const getStockStatus = (quantity: number) => {
    if (!product) return { status: "Unknown", color: "text-muted-foreground" };

    if (quantity === 0) {
      return { status: "Out of Stock", color: "text-destructive" };
    } else if (quantity <= product.low_stock_threshold) {
      return { status: "Low Stock", color: "text-warning" };
    } else {
      return { status: "In Stock", color: "text-success" };
    }
  };

  const adjustmentInfo = getAdjustmentInfo();
  const currentStatus = getStockStatus(product?.inventory_quantity || 0);
  const newStatus = getStockStatus(Number(newQuantity) || 0);

  const renderTrigger = () => {
    if (triggerSize === "icon") {
      return (
        <Button
          variant={triggerVariant}
          size="icon"
          onPress={handleOpen}
          disabled={disabled || !product}
        >
          <ArrowUp01Icon size={16} className="text-foreground" color={resolvedColors.foreground} />
        </Button>
      );
    }

    return (
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onPress={handleOpen}
        disabled={disabled || !product}
        className="flex-row items-center gap-2"
      >
        <ArrowUp01Icon size={16} className="text-muted-foreground" />
        <Text className="text-muted-foreground">
          {triggerText || "Update Inventory"}
        </Text>
      </Button>
    );
  };

  const renderContent = () => (
    <View className="gap-6">
      {/* Product Info */}
      <Card className="p-4">
        <Text className="text-lg font-semibold text-foreground mb-2">
          {product?.name}
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          SKU: {product?.sku}
        </Text>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-muted-foreground">Current Stock</Text>
            <Text className="text-xl font-bold text-foreground">
              {product?.inventory_quantity}
            </Text>
            <Text className={`text-xs ${currentStatus.color}`}>
              {currentStatus.status}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted-foreground">
              Low Stock Alert
            </Text>
            <Text className="text-sm font-semibold text-foreground">
              {product?.low_stock_threshold}
            </Text>
          </View>
        </View>
      </Card>

      {/* Inventory Update Form */}
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium">
            New Stock Quantity <Text className="text-destructive">*</Text>
          </Text>
          <Input
            value={newQuantity}
            onChangeText={setNewQuantity}
            placeholder="Enter new stock quantity"
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium">
            Base Price
          </Text>
          <Input
            value={basePrice}
            onChangeText={setBasePrice}
            placeholder="Enter base price"
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium">
            Sale Price
          </Text>
          <Input
            value={salePrice}
            onChangeText={setSalePrice}
            placeholder="Enter sale price"
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        </View>

        {/* Adjustment Preview */}
        {adjustmentInfo.type !== "none" && (
          <Card className="p-4 bg-muted">
            <Text className="text-sm font-medium mb-2">Adjustment Preview</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Change Type
                </Text>
                <Text
                  className={`text-sm font-semibold ${
                    adjustmentInfo.type === "addition"
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  {adjustmentInfo.type === "addition"
                    ? "Addition"
                    : "Reduction"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Change Amount
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {adjustmentInfo.type === "addition" ? "+" : "-"}
                  {adjustmentInfo.difference}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  New Status
                </Text>
                <Text className={`text-sm font-semibold ${newStatus.color}`}>
                  {newStatus.status}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View className="flex-row gap-3">
      <Button
        variant="outline"
        onPress={handleClose}
        disabled={isSubmitting}
        className="flex-1"
      >
        <Text className="font-semibold text-foreground">Cancel</Text>
      </Button>

      <Button
        variant="primary"
        disabled={
          !newQuantity ||
          isNaN(Number(newQuantity)) ||
          Number(newQuantity) < 0 ||
          isSubmitting
        }
        onPress={handleSubmit}
        className="flex-1"
      >
        <Text className="text-foreground font-semibold">
          {isSubmitting ? "Updating..." : "Update Inventory"}
        </Text>
      </Button>
    </View>
  );

  return (
    <>
      {renderTrigger()}

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={handleClose}
        title="Update Inventory"
        snapPoints={["70%"]}
        footer={renderFooter()}
      >
        {renderContent()}
      </ResponsiveModal>
    </>
  );
}

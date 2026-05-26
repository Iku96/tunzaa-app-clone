
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Platform,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { X, Menu, ShoppingCart } from "lucide-react-native";
import { DesktopNavigation } from "../layout/DesktopNavigation";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import CartScreen from "../cart";
import { useCartCombined } from "@/stores/cart"; // Import useCartCombined to access cart data
import { useAuth } from "@/context/auth"; // Import useAuth to get user
import { useI18n } from "@/hooks/useI18n";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function CartDrawer() {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current; // Start off-screen right
  const { user } = useAuth(); // Get user
  const cart = useCartCombined(user?.user_id ?? ""); // Get cart data
  const { t } = useI18n();
  // Calculate total number of items (confirmed + optimistic)
  const totalItems = (cart.cart?.items?.length || 0) + (cart.optimisticItems?.length || 0);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Drawer width 300 from right side
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  if (Platform.OS !== "web") return null;

  return (
    <>
      {/* Menu Button with Icon and Badge */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="lg:flex hidden items-center space-x-1 px-3 py-1 relative"
        accessibilityLabel="Open cart drawer"
      >
        <ShoppingCart size={24} className="text-gray-600" />
        {totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full px-2 py-1 min-w-[24px] h-6 flex items-center justify-center"
          >
            <Text className="text-xs font-semibold text-white">{totalItems}</Text>
          </Badge>
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        onRequestClose={() => setVisible(false)}
        transparent
        animationType="none" // We'll control animation ourselves
      >
        <View style={styles.container}>
          {/* Overlay */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setVisible(false)}
            activeOpacity={1}
          />

          {/* Animated Drawer */}
          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text className="text-lg font-semibold">{t("cart.shopping_cart")}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <X size={20} />
              </TouchableOpacity>
            </View>

            {/* Cart Content */}
            {visible && <CartScreen setVisible={setVisible} />}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 400,
    backgroundColor: 'white',
    padding: 8,
    height: "100%",
    zIndex: 999999, // Ensure it's above overlay
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
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
import { X, Menu } from "lucide-react-native";
import { DesktopNavigation } from "../layout/DesktopNavigation";
import { Text } from "@/components/ui/text";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function NavigationDrawer() {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current; // Start off-screen right

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
      {/* Menu Button with Icon */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="lg:flex hidden items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md hover:bg-muted"
        accessibilityLabel="Open navigation drawer"
      >
        <Menu size={20} className="text-muted-foreground" />
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
              <Text className="text-lg font-semibold">Menu</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <X size={20} />
              </TouchableOpacity>
            </View>

            {/* Navigation List - pass styles to DesktopNavigation */}
            {visible && (
              <DesktopNavigation
                itemContainerStyle={styles.navItem}
                textStyle={styles.navItemText}
              />
            )}
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
    width: 300,
    backgroundColor: 'white',
    padding: 16,
    height: "100%",
    zIndex: 999999, // Ensure it's above overlay
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navItem: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-start",
  },
  navItemText: {
    textAlign: "left",
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LayoutGrid } from 'lucide-react-native';
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { VendorOrders } from "@/components/orders/VendorOrders";
import SidebarMenu from '@/src/components/merchant/SidebarMenu';

export default function OrdersScreen() {
  const { user } = useTunzaaAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <SidebarMenu isVisible={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
            <LayoutGrid size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ flex: 1 }}>
        <VendorOrders />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  }
});

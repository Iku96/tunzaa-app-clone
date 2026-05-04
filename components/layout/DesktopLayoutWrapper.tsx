import React from "react";
import { View, Platform } from "react-native";
import { DesktopNavBar } from "./DesktopNavBar";
import { DesktopFooter } from "./DesktopFooter";
import { CategoriesSidebar } from "./CategoriesSidebar";
import { DesktopBreadcrumbNav } from "../Drawer/DesktopBreadcrumbNav";
import { ScrollView } from "@/components/ui/scroll-view";
import { usePathname, useLocalSearchParams } from "expo-router";
import { ProductsParams } from "@/src/services/products";

// Web-optimized scrollable container
const WebScrollView = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  if (Platform.OS === "web") {
    return (
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden ${className}`}
        style={{
          WebkitOverflowScrolling: "touch",
          height: "100%",
          minHeight: 0, // Important for flex children
          contain: "layout style paint",
        }}
      >
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <ScrollView
      className={`flex-1 ${className}`}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={true}
    >
      {children}
    </ScrollView>
  );
};

interface DesktopLayoutWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showNavBar?: boolean;
  showSecondaryNav?: boolean;
  showFooter?: boolean;
  showCartIcon?: boolean;
  sidebarContent?: React.ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  layoutType?: "default" | "centered" | "full-width" | "auth";
  store_id?: string; // Added for CategoriesSidebar
  category_id?: string; // Added for CategoriesSidebar
  onFiltersChange?: (filters: ProductsParams) => void; // Added for CategoriesSidebar
  onSearch?: (query: string) => void; // Added for CategoriesSidebar
}

export function DesktopLayoutWrapper({
  children,
  showSidebar = false,
  showSecondaryNav = true,
  showNavBar = true,
  showFooter = true,
  sidebarContent,
  showCartIcon = true,
  containerClassName = "",
  contentClassName = "",
  layoutType = "default",
  store_id,
  category_id,
  onFiltersChange = () => {}, // Default to no-op
  onSearch = () => {}, // Default to no-op
}: DesktopLayoutWrapperProps) {
  const pathname = usePathname();
  const params = useLocalSearchParams();

  // Derive category_id and isCategoryScreen
  const isCategoryScreen = pathname.startsWith("/categories/");

  // On mobile/tablet, just render children without desktop layout
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  // Auth layout - centered form
  if (layoutType === "auth") {
    return (
      <ScrollView>
        <View className={`min-h-screen flex flex-col bg-gray-50 ${containerClassName}`}>
          {showNavBar && <DesktopNavBar />}
          <View className={`flex-1 px-2 py-2 ${contentClassName}`}>{children}</View>
          {showFooter && <DesktopFooter />}
        </View>
      </ScrollView>
    );
  }

  // Centered layout - for landing pages
  if (layoutType === "centered") {
    return (
      <View className={`min-h-screen flex flex-col bg-gray-50 ${containerClassName}`}>
        {showNavBar && <DesktopNavBar />}
        <WebScrollView className="flex-1">
          <View className="flex-1 flex items-center justify-center px-8 py-8">
            <View className={`w-full max-w-4xl ${contentClassName}`}>{children}</View>
          </View>
        </WebScrollView>
        {showFooter && <DesktopFooter />}
      </View>
    );
  }

  // Full-width layout - for dashboards
  if (layoutType === "full-width") {
    return (
      <View className={`min-h-screen flex flex-col bg-gray-50 ${containerClassName}`}>
        {showNavBar && <DesktopNavBar />}
        <WebScrollView className="flex-1">
          <View className={`flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 ${contentClassName}`}>
            {children}
          </View>
        </WebScrollView>
        {showFooter && <DesktopFooter />}
      </View>
    );
  }

  // Default layout with optional sidebar
  return (
    <View className="flex-1 bg-white">
      {/* Desktop Navigation */}
      {showNavBar && <DesktopNavBar showCartIcon={showCartIcon} showSecondaryNav={showSecondaryNav} />}

      {/* Main Content Area */}
      <ScrollView>
        {/* Desktop Layout with Sidebar */}
        <View className="hidden lg:flex flex-1 w-full px-12 sm:px-16 lg:px-[80px] py-2 space-y-2">
          <View className="w-full">
            <View className="flex-row gap-8">
              {/* Sidebar */}
              {showSidebar && (
                <View className="w-64 flex-shrink-0 lg:pl-0">
                  {sidebarContent || (
                    <CategoriesSidebar
                      store_id={store_id}
                      category_id={category_id}
                      onFiltersChange={onFiltersChange}
                      onSearch={onSearch}
                      isCategoryScreen={isCategoryScreen}
                    />
                  )}
                </View>
              )}

              {/* Main Content */}
              <View className={`flex-1 w-full ${contentClassName}`}>
                {/* <DesktopBreadcrumbNav /> */}
                {children}
              </View>
            </View>
            {showFooter && <DesktopFooter />}
          </View>
        </View>
        {/* Mobile/Tablet - Full Width Content */}
        <View className="lg:hidden flex-1">{children}</View>
      </ScrollView>
    </View>
  );
}
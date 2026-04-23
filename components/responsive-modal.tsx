import React, { useCallback, useRef, useState, useEffect } from "react";
import { Platform, View, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";

interface ResponsiveModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  snapPoints?: string[];
  enableScrolling?: boolean;
  dismissible?: boolean; // Controls whether modal can be dismissed
  fitContent?: boolean; // Automatically size to fit all content including footer in viewport
}

/**
 * ResponsiveModal Component
 *
 * A modal that works across mobile and web platforms with advanced content fitting capabilities.
 *
 * Key Features:
 * - `fitContent`: When true, automatically sizes the modal to show all content including footer
 * - `dismissible`: Controls whether users can dismiss the modal by tapping backdrop, swiping, etc.
 * - Cross-platform: Works on mobile (BottomSheet) and web (Dialog)
 *
 * Usage Examples:
 *
 * // Standard modal with snap points
 * <ResponsiveModal isOpen={true} snapPoints={["50%", "80%"]}>
 *   <YourContent />
 * </ResponsiveModal>
 *
 * // Auto-fit modal that shows all content immediately
 * <ResponsiveModal isOpen={true} fitContent={true}>
 *   <YourContent />
 * </ResponsiveModal>
 *
 * // Non-dismissible modal (e.g., for mandatory language selection)
 * <ResponsiveModal isOpen={true} dismissible={false} fitContent={true}>
 *   <YourContent />
 * </ResponsiveModal>
 */
export const ResponsiveModal = ({
  isOpen,
  onOpenChange,
  title,
  children,
  footer,
  snapPoints = ["50%"],
  enableScrolling = true,
  dismissible = true,
  fitContent = false,
}: ResponsiveModalProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();

  // Handle opening/closing the modal based on isOpen state
  useEffect(() => {
    if (Platform.OS !== "web") {
      if (isOpen) {
        bottomSheetModalRef.current?.present();
      } else {
        bottomSheetModalRef.current?.dismiss();
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dismissible) {
      onOpenChange(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={dismissible ? "close" : "none"}
      />
    ),
    [dismissible]
  );

  // Render footer using official BottomSheetFooter component
  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={10}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: resolvedColors?.muted || colors.backgroundSecondary,
            borderTopWidth: 1,
            borderTopColor: resolvedColors?.muted || colors.backgroundSecondary,
          }}
        >
          {footer}
        </View>
      </BottomSheetFooter>
    ),
    [footer, colors, resolvedColors]
  );

  if (Platform.OS === "web") {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={dismissible ? onOpenChange : undefined}
      >
        <DialogContent
          className={`web:w-[80vw] web:max-w-lg web:flex web:flex-col ${
            fitContent ? "web:max-h-fit" : "web:max-h-[80vh]"
          }`}
        >
          {title && (
            <DialogHeader className="web:flex-shrink-0">
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}

          {/* Scrollable content area */}
          <div
            className={`${
              fitContent
                ? "web:max-h-[60vh] web:overflow-y-auto"
                : "web:flex-1 web:overflow-y-auto web:min-h-0"
            }`}
          >
            {children}
          </div>

          {footer && (
            <DialogFooter className="web:flex-shrink-0 web:border-t web:pt-4 web:mt-4">
              {footer}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheetModal

      ref={bottomSheetModalRef}
      snapPoints={fitContent ? ["90%"] : snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={dismissible}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: resolvedColors?.muted || colors.backgroundSecondary }}
      handleIndicatorStyle={{backgroundColor: resolvedColors?.mutedForeground || colors.backgroundSecondary}}
      onDismiss={handleClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      footerComponent={footer ? renderFooter : undefined}
    >
      {/* Scrollable content - direct child of BottomSheetModal */}
      {enableScrolling ? (
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: footer ? 100 : 16, // Extra padding when footer is present
          }}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          {title && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: resolvedColors?.muted || colors.backgroundSecondary,
              }}
            >
              <Text className="text-2xl font-bold text-center">{title}</Text>
            </View>
          )}

          {/* Content */}
          <View style={{ paddingHorizontal: 16 }}>{children}</View>
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={{ flex: 1 }}>
          {/* Header */}
          {title && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: resolvedColors?.muted || colors.backgroundSecondary,
              }}
            >
              <Text className="text-2xl font-bold text-center">{title}</Text>
            </View>
          )}

          {/* Content */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: footer ? 100 : 16, // Extra padding when footer is present
              flex: 1,
            }}
          >
            {children}
          </View>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
};

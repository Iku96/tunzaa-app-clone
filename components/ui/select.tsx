import * as SelectPrimitive from "@rn-primitives/select";
import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Check } from "@/lib/icons/Check";
import { ChevronDown } from "@/lib/icons/ChevronDown";
import { ChevronUp } from "@/lib/icons/ChevronUp";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

type Option = SelectPrimitive.Option;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  SelectPrimitive.TriggerRef,
  SelectPrimitive.TriggerProps & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    // @ts-ignore
    className={cn(
      "flex flex-row h-10 native:h-14 items-center text-sm justify-between rounded-md border border-input bg-background px-3 py-2 native:px-4 native:py-3 web:ring-offset-background text-muted-foreground web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 [&>span]:line-clamp-1",
      props.disabled && "web:cursor-not-allowed opacity-50",
      className
    )}
    {...(props as any)}
  >
    <View className="flex-1 flex-row items-center justify-between">
      {typeof children === "function" ? children({ pressed: false }) : children}
      <ChevronDown
        size={16}
        aria-hidden={true}
        className="text-foreground opacity-50"
      />
    </View>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/**
 * Platform: WEB ONLY
 */
const SelectScrollUpButton = ({
  className,
  ...props
}: SelectPrimitive.ScrollUpButtonProps & { className?: string }) => {
  if (Platform.OS !== "web") {
    return null;
  }
  return (
    <SelectPrimitive.ScrollUpButton
      // @ts-ignore
      className={cn(
        "flex web:cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp size={14} className="text-foreground" />
    </SelectPrimitive.ScrollUpButton>
  );
};

/**
 * Platform: WEB ONLY
 */
const SelectScrollDownButton = ({
  className,
  ...props
}: SelectPrimitive.ScrollDownButtonProps & { className?: string }) => {
  if (Platform.OS !== "web") {
    return null;
  }
  return (
    <SelectPrimitive.ScrollDownButton
      // @ts-ignore
      className={cn(
        "flex web:cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown size={14} className="text-foreground" />
    </SelectPrimitive.ScrollDownButton>
  );
};

const SelectOverlay = React.forwardRef<
  SelectPrimitive.OverlayRef,
  SelectPrimitive.OverlayProps & { className?: string }
>(({ className, ...props }, ref) => {
  if (Platform.OS === "web") {
    return (
      <SelectPrimitive.Overlay
        ref={ref}
        // @ts-ignore
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        className={className}
        {...props}
      />
    );
  }

  return (
    <SelectPrimitive.Overlay
      ref={ref}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      ]}
      // @ts-ignore
      className={className}
      {...props}
    />
  );
});

SelectOverlay.displayName = SelectPrimitive.Overlay.displayName;


const SelectContent = React.forwardRef<
  SelectPrimitive.ContentRef,
  SelectPrimitive.ContentProps & { portalHost?: string; className?: string }
>(({ className, children, position = "popper", portalHost, ...props }, ref) => {
  const { open } = SelectPrimitive.useRootContext();

  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <SelectOverlay />
        <Animated.View
          style={{ zIndex: 1000 }}
          className="z-50"
          entering={FadeIn.springify().damping(20).stiffness(300)}
          exiting={FadeOut.duration(200)}
        >
          <SelectPrimitive.Content
            ref={ref}
            style={{ backgroundColor: "white", borderRadius: 10 }}
            // @ts-ignore
            className={cn(
              "relative z-50 max-h-96 min-w-[12rem] overflow-hidden rounded-md border border-input bg-white dark:bg-zinc-900 shadow-xl shadow-black/10",
              position === "popper" && "data-[side=bottom]:translate-y-2 data-[side=top]:-translate-y-2",
              open
                ? "web:zoom-in-95 web:animate-in web:fade-in-0"
                : "web:zoom-out-95 web:animate-out web:fade-out-0",
              className
            )}
            position={position}
            {...props}
          >
            <View className="flex-1">
              <SelectScrollUpButton />
              <SelectPrimitive.Viewport
                // @ts-ignore
                className={cn(
                  "p-2", // Internal breathing room for the list
                  position === "popper" &&
                  "w-full min-w-[var(--radix-select-trigger-width)]"
                )}
              >
                {children}
              </SelectPrimitive.Viewport>
              <SelectScrollDownButton />
            </View>
          </SelectPrimitive.Content>
        </Animated.View>
      </View>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  SelectPrimitive.LabelRef,
  SelectPrimitive.LabelProps & { className?: string }
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    // @ts-ignore
    className={cn(
      "py-1.5 native:pb-3 pl-8 native:pl-12 pr-2 text-popover-foreground text-sm native:text-base font-semibold",
      className
    )}
    {...props}
    asChild
  >
    <Text />
  </SelectPrimitive.Label>
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  SelectPrimitive.ItemRef,
  SelectPrimitive.ItemProps & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    // @ts-ignore
    style={Platform.OS !== "web" ? { paddingLeft: 16, paddingRight: 38, paddingVertical: 12 } : undefined}
    {...props}
    // @ts-ignore
    className={cn(
      "relative web:group flex flex-row w-full web:cursor-default web:select-none items-center rounded-sm py-3 native:py-4 pl-3 native:pl-4 pr-10 native:pr-12 mx-1 web:hover:bg-accent/50 active:bg-accent web:outline-none web:focus:bg-accent",
      props.disabled && "web:pointer-events-none opacity-50",
      className
    )}
  >
    <View className="flex-1 flex-row items-center">
      <View className="absolute right-3 native:right-4 top-0 bottom-0 flex justify-center items-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={16} strokeWidth={3} className="text-primary" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText
        // @ts-ignore
        className="text-sm native:text-lg font-medium text-popover-foreground web:group-focus:text-accent-foreground"
      />
    </View>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  SelectPrimitive.SeparatorRef,
  SelectPrimitive.SeparatorProps & { className?: string }
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    // @ts-ignore
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
};

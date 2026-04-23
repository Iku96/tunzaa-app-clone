import * as SeparatorPrimitive from "@rn-primitives/separator";
import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  SeparatorPrimitive.RootRef,
  SeparatorPrimitive.RootProps & { className?: string }
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      asChild
    >
      <View
        ref={ref}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    </SeparatorPrimitive.Root>
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

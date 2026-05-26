import React from "react";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export interface BuyerFormData {
  name: string;
  email: string;
  password: string;
}

interface BuyerFormProps {
  onSubmit: (data: BuyerFormData) => void;
  isLoading: boolean;
}

export function BuyerForm({ onSubmit, isLoading }: BuyerFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const resolvedColors = useResolvedThemeColors();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Full Name<Text className="text-destructive">*</Text>
        </Text>
        <Controller
          control={control}
          name="name"
          rules={{
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your full name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
          )}
        />
        {errors.name && (
          <Text className="text-sm text-destructive">
            {errors.name.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Email<Text className="text-destructive">*</Text>
        </Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              className={errors.email ? "border-destructive" : ""}
            />
          )}
        />
        {errors.email && (
          <Text className="text-sm text-destructive">
            {errors.email.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Password<Text className="text-destructive">*</Text>
        </Text>
        <View className="relative">
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Create a password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                className={
                  errors.password ? "border-destructive pr-12" : "pr-12"
                }
              />
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8"
            onPress={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff size={16} className="text-muted-foreground" color={resolvedColors?.foreground || "#000000"} />
            ) : (
              <Eye size={16} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
            )}
          </Button>
        </View>
        {errors.password && (
          <Text className="text-sm text-destructive">
            {errors.password.message}
          </Text>
        )}
        <Text className="text-xs text-muted-foreground">
          Password must be at least 8 characters long
        </Text>
      </View>

      <Button
        variant="default"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        className="w-full"
      >
        <Text className="text-primary font-semibold">
          {isLoading ? "Creating Profile..." : "Complete Profile"}
        </Text>
      </Button>
    </View>
  );
}

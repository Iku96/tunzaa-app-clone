import React from "react";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

export interface AffiliateFormData {
  bio: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

interface AffiliateFormProps {
  onSubmit: (data: AffiliateFormData) => void;
  isLoading: boolean;
}

export function AffiliateForm({ onSubmit, isLoading }: AffiliateFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AffiliateFormData>({
    defaultValues: {
      bio: "",
      instagram: "",
      twitter: "",
      facebook: "",
    },
  });

  return (
    <View className="gap-6">
        {/* Affiliate Information Section */}
        <View className="gap-6">
          <Text className="text-lg font-semibold text-foreground">
            Affiliate Information
          </Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Bio<Text className="text-destructive">*</Text>
            </Text>
            <Controller
              control={control}
              name="bio"
              rules={{
                required: "Bio is required",
                minLength: {
                  value: 10,
                  message: "Bio must be at least 10 characters",
                },
                maxLength: {
                  value: 500,
                  message: "Bio cannot exceed 500 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Tell us about your affiliate marketing experience"
                  value={value}
                  editable={!isLoading}
                  aria-labelledby="textareaLabel"
                  className={errors.bio ? "border-destructive" : ""}
                />
              )}
            />
            {errors.bio && (
              <Text className="text-sm text-destructive">
                {errors.bio.message}
              </Text>
            )}
            <Text className="text-xs text-muted-foreground">
              Describe your affiliate marketing experience and expertise
            </Text>
          </View>
        </View>

        {/* Social Media Section */}
        <View className="gap-6">
          <Text className="text-lg font-semibold text-foreground">
            Social Media (Optional)
          </Text>
          <Text className="text-sm text-muted-foreground">
            Connect your social media accounts to showcase your reach
          </Text>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Instagram Handle
            </Text>
            <Controller
              control={control}
              name="instagram"
              rules={{
                pattern: {
                  value: /^@?[a-zA-Z0-9._]+$/,
                  message: "Please enter a valid Instagram handle",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="@yourusername"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  editable={!isLoading}
                  className={errors.instagram ? "border-destructive" : ""}
                />
              )}
            />
            {errors.instagram && (
              <Text className="text-sm text-destructive">
                {errors.instagram.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Twitter Handle
            </Text>
            <Controller
              control={control}
              name="twitter"
              rules={{
                pattern: {
                  value: /^@?[a-zA-Z0-9_]+$/,
                  message: "Please enter a valid Twitter handle",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="@yourusername"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  editable={!isLoading}
                  className={errors.twitter ? "border-destructive" : ""}
                />
              )}
            />
            {errors.twitter && (
              <Text className="text-sm text-destructive">
                {errors.twitter.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Facebook Profile/Page
            </Text>
            <Controller
              control={control}
              name="facebook"
              rules={{
                pattern: {
                  value: /^[a-zA-Z0-9.]+$/,
                  message:
                    "Please enter a valid Facebook username or page name",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="yourusername or pagename"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  editable={!isLoading}
                  className={errors.facebook ? "border-destructive" : ""}
                />
              )}
            />
            {errors.facebook && (
              <Text className="text-sm text-destructive">
                {errors.facebook.message}
              </Text>
            )}
          </View>
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

// components/PhoneInput.tsx
import { View, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useI18n } from "@/hooks/useI18n";

const COUNTRIES = [
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Congo", code: "+243", flag: "🇨🇩" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
];

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedCountry: {
    name: string;
    code: string;
    flag: string;
  };
  onCountryChange: (country: {
    name: string;
    code: string;
    flag: string;
  }) => void;
  label?: string;
  required?: boolean;
  editable?: boolean;
}

export function PhoneInput({
  value,
  onChangeText,
  selectedCountry,
  onCountryChange,
  label,
  required,
  editable = true,
}: PhoneInputProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const { t } = useI18n();

  // Update display value when external value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleTextChange = (text: string) => {
    // Allow user to input the full text including leading zero
    setDisplayValue(text);
    
    // Remove leading zero when returning the value to parent
    const trimmed = text.trim();
    const withoutLeadingZero = trimmed.startsWith("0")
      ? trimmed.slice(1)
      : trimmed;
    
    onChangeText(withoutLeadingZero);
  };

  return (
    <View className="gap-2">
      {label && (
        <Text className="text-sm font-semibold text-foreground">
          {label}
          {required && <Text className="text-destructive">*</Text>}
        </Text>
      )}

      <View className="flex-row items-center">
        <Button
          variant="outline"
          className="flex-row items-center gap-1 h-10 px-2"
          onPress={() => setShowCountryPicker(true)}
        >
          <Text className="text-base">{selectedCountry.flag}</Text>
          <Text className="text-sm font-medium text-foreground">
            {selectedCountry.code}
          </Text>
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>

        <Input
          value={displayValue}
          onChangeText={handleTextChange}
          keyboardType="phone-pad"
          placeholder={t("phone_input.enter_phone_number")}
          editable={editable}
          className="flex-1 ml-2"
        />
      </View>

      <ResponsiveModal
        isOpen={showCountryPicker}
        onOpenChange={setShowCountryPicker}
        title={t("phone_input.select_country")}
        snapPoints={["50%"]}
      >
        <FlatList
          data={COUNTRIES}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Button
              variant="ghost"
              className={cn(
                "flex-row items-center gap-3 h-14 px-4",
                selectedCountry.code === item.code && "bg-accent"
              )}
              onPress={() => {
                onCountryChange(item);
                setShowCountryPicker(false);
              }}
            >
              <Text className="text-xl">{item.flag}</Text>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">
                  {item.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {item.code}
                </Text>
              </View>
            </Button>
          )}
          className="-mx-4"
        />
      </ResponsiveModal>
    </View>
  );
}

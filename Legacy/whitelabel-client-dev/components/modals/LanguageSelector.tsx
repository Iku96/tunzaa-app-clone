import React, { useState } from "react";
import { View } from "react-native";
import { Check } from "lucide-react-native";
import { usePreferencesStore } from "@/stores/preferences";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useI18n } from "@/hooks/useI18n";
import { useUpdateUser } from "@/services/auth";
import { useAuth } from "@/context/auth";

import { languages } from "@/stores/preferences";

type Language = (typeof languages)[number]["code"];

function getValidLanguage(lang: string): Language {
  return languages.some((l) => l.code === lang) ? (lang as Language) : "en";
}

interface LanguageSelectorProps {
  isFirstTime?: boolean;
  onLanguageSelected?: () => void;
}

export const LanguageSelector = ({
  isFirstTime = false,
  onLanguageSelected,
}: LanguageSelectorProps) => {
  const { getLanguageName, getLanguageFlag } = usePreferencesStore();
  const { t, language, changeLanguage } = useI18n();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isOpen, setIsOpen] = useState(isFirstTime);

  const updateUserMutation = useUpdateUser();

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleConfirm = async () => {
    const preferredLang = ["en", "fr", "sw"].includes(selectedLanguage)
      ? selectedLanguage
      : undefined;

    // Only update API if user exists
    if (user && preferredLang) {
      try {
        const nameParts = user.name?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await updateUserMutation.mutateAsync({
          userId: user.user_id,
          data: {
            first_name: firstName,
            last_name: lastName,
            preferred_language: preferredLang,
          },
        });
      } catch (error) {
        console.error("Failed to update preferred language", error);
      }
    }

    // Switch i18n language immediately
    changeLanguage(selectedLanguage as "en" | "fr" | "sw");
    setIsOpen(false);
    onLanguageSelected?.();
  };

  const handleOpen = () => {
    setSelectedLanguage(getValidLanguage(language));
    setIsOpen(true);
  };

  const renderLanguageOptions = () => (
    <View className="gap-4">
      {languages.map((lang) => (
        <Button
          variant={selectedLanguage === lang.code ? "primary" : "outline"}
          size="lg"
          key={lang.code}
          onPress={() => handleLanguageSelect(lang.code)}
          className="flex-row items-center p-4 rounded-lg"
        >
          <Text className="text-2xl mr-2">{getLanguageFlag(lang.code as any)}</Text>
          <Text className="flex-1 text-lg">{getLanguageName(lang.code as any)}</Text>
          {selectedLanguage === lang.code && (
            <Check size={20} className="text-primary-foreground" />
          )}
        </Button>
      ))}
    </View>
  );

  const renderFooter = () => (
    <View
      className={`flex-row gap-2 ${
        isFirstTime ? "justify-center" : "justify-between"
      }`}
    >
      <Button
        variant={isFirstTime ? "secondary" : "default"}
        onPress={handleConfirm}
        className={isFirstTime ? "w-full" : "flex-1"}
      >
        <Text className="text-primary font-bold">{t("auth.confirm")}</Text>
      </Button>
      {!isFirstTime && (
        <Button
          variant="secondary"
          onPress={() => setIsOpen(false)}
          className="flex-1"
        >
          <Text className="font-semibold text-primary">{t("auth.cancel")}</Text>
        </Button>
      )}
    </View>
  );

  return (
    <>
      {!isFirstTime && (
        <Button
          onPress={handleOpen}
          variant="outline"
          className="flex-row items-center"
        >
          <Text className="text-2xl mr-2">{getLanguageFlag(language as any)}</Text>
          <Text className="text-primary font-semibold">
            {language.toUpperCase()}
          </Text>
        </Button>
      )}

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={isFirstTime ? () => {} : setIsOpen}
        title={isFirstTime ? t("auth.select_language") : t("auth.select_language")}
        footer={renderFooter()}
        snapPoints={["45%"]}
        dismissible={!isFirstTime}
        enableScrolling={true}
      >
        {renderLanguageOptions()}
      </ResponsiveModal>
    </>
  );
};

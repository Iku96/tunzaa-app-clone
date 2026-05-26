//Create the app version component

import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { getAppVersion, getBuildNumber } from "@/utils/appVersion";

export const AppVersion = () => {
  const appVersion = getAppVersion();
  const buildNumber = getBuildNumber();

  return (
    <View className="flex items-center justify-center gap-2 text-center">
      <Text className="text-sm text-gray-500 text-center">App Version: {appVersion} ({buildNumber})</Text>
    </View>
  );
};
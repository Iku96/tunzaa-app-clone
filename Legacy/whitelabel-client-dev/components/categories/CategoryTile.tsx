import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../ui/text";
import { Image } from "expo-image";
import { useResponsive } from "@/hooks/useResponsive";

export interface CategoryTileProps {
  id: string;
  name: string;
  icon?: string;
}

export function CategoryTile({ id, name, icon }: CategoryTileProps) {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const handlePress = () => {
    router.push(`/categories/${id}`);
  };

  // Sizes based on device type
  const tileSize = isDesktop ? 150 : 100;
  const imageSize = isDesktop ? 60 : 40;
  const imageContainerSize = isDesktop ? 140 : 60;

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="items-center rounded-xl mr-2"
      style={{
        width: tileSize,
        height: tileSize,
      }}
    >
      <View
        className="rounded-full bg-gray-200 items-center justify-center"
        style={{
          width: imageContainerSize,
          height: imageContainerSize,
        }}
      >
        {icon && (
          <Image
            source={{ uri: icon }}
            style={{ width: imageSize, height: imageSize }}
            contentFit="contain"
          />
        )}
      </View>
      <View className="flex-1 items-center mt-2">
        <Text
          className="text-xs font-medium text-center"
          style={{ width: tileSize - 20 }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

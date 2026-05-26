import { View } from "react-native";
import { ProductTile } from "@/components/products/ProductTile";
import { Product } from "@/services/products";
import { Text } from "@/components/ui/text";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

export default function NearbyProducts({ products }: { products: Product[] }) {
  const { isDesktop } = useResponsive();
  const { t } = useI18n();

  return (
    <View className={`p-4 border-t-8 border-muted ${isDesktop ? 'bg-white' : 'bg-background'}`}>
      <Text className="text-lg font-bold text-foreground mb-4">
        {t("products.closer_to_area")}
      </Text>

      <View className="flex-row flex-wrap gap-4">
        {products.map((nearbyProduct) =>
          !isDesktop ? (
            <View key={nearbyProduct._id} className="w-[48%]">
              <ProductTile product={nearbyProduct} variant="compact" />
            </View>
          ) : (
            <ProductTile
              key={nearbyProduct._id}
              product={nearbyProduct}
              variant="compact"
            />
          )
        )}
      </View>
    </View>
  );
}

import { View, Dimensions } from "react-native";
import { Product } from "@/stores/products";
import { ProductTile } from "@/components/products/ProductTile";

const NUM_COLUMNS = 2;
const GRID_SPACING = 8;

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { width } = Dimensions.get("window");
  const itemWidth =
    (width - (32 + GRID_SPACING * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

  return (
    <View className="flex-row flex-wrap px-4">
      {products.map((product) => (
        <View
          key={product.product_id}
          className="mb-4"
          style={{ width: itemWidth, marginRight: GRID_SPACING }}
        >
          <ProductTile product={product} />
        </View>
      ))}
    </View>
  );
}

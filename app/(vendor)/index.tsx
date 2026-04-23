import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { VendorHome } from "@/components/home/VendorHome";

export default function HomeScreen() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]} className="bg-background">
      <VendorHome />
    </SafeAreaView>
  );
}

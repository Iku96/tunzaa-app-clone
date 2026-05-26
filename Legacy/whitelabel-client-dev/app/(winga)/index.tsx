import { useAuth } from "@/context/auth";
import { AffiliateHome } from "@/components/home/AffiliateHome";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-muted" edges={['top', 'left', 'right']}>
      <AffiliateHome />
    </SafeAreaView>
  );
}

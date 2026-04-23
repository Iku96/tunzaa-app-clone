import React from "react";
import { Link, router, Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useRouter } from "expo-router";
export default function NotFoundScreen() {
  const { logout } = useAuth();
  const signOut = async () => {
    await logout();
    router.replace("/");
  }
  
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <SafeAreaView className="flex-1 bg-muted">
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center max-w-sm">
            <Text className="text-4xl font-bold text-foreground mb-4 text-center">
              404
            </Text>
            <Text className="text-xl text-muted-foreground mb-8 text-center">
              This screen doesn't exist.
            </Text>
            
            <Link href="/" asChild>
              <Button variant="default" className="w-full mb-4">
                <Text className="text-primary-foreground font-semibold">
                  Keep shopping & selling!
                </Text>
              </Button>
            </Link>

            <Button variant="destructive" className="w-full" onPress={signOut}>
              <Text className="text-foreground font-semibold">
               Logout
              </Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

import React from "react";
import {
    Alert,
} from "react-native";
import {
    ChevronRight,

    Trash,
} from "lucide-react-native";
import * as Burnt from "burnt";

import { useAuth } from "@/context/auth";
import { useI18n } from "@/hooks/useI18n";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { authApi } from "@/src/services/auth";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function DeleteAccount() {
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const resolvedColors = useResolvedThemeColors();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        const userId = user?.user_id || user?.id;
        console.log("🔴 [Deactivate Account] handleDelete triggered in DeleteAccount.tsx");
        console.log("🛠️ [Deactivate Account] Attempting with userId:", userId);

        if (!userId) {
            console.error("❌ [Deactivate Account] No user ID found for deletion");
            Alert.alert("Error", "Could not find your user ID. Please try logging out and in again.");
            return;
        }

        setIsDeleting(true);
        try {
            await authApi.disableUser();
            console.log("✅ [Deactivate Account] API call successful");

            Burnt.toast({
                title: t("account.account_deleted_success"),
                preset: "done",
            });

            await logout();
        } catch (error: any) {
            console.error("❌ [Deactivate Account] Deactivation failed:", error);
            Burnt.toast({
                title: t("account.account_deleted_failed"),
                preset: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg">
                    {t("account.delete_account")}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <Button
                    variant="destructive"
                    className="flex-row items-center"
                    disabled={isDeleting}
                    onPress={() => {
                        Alert.alert(
                            t("account.delete_account"),
                            t("account.are_you_sure_delete_full"),
                            [
                                {
                                    text: t("common.cancel"),
                                    style: "cancel",
                                },
                                {
                                    text: t("common.delete"),
                                    style: "destructive",
                                    onPress: handleDelete,
                                },
                            ]
                        );
                    }}
                >
                    <Trash size={20} color={resolvedColors?.foreground} />
                    <Text className="flex-1 ml-3 text-base font-medium text-foreground">
                        {isDeleting ? t("common.deleting") : t("account.delete_account")}
                    </Text>
                    <ChevronRight size={20} color={resolvedColors?.foreground} />
                </Button>
            </CardContent>
        </Card>
    );
}
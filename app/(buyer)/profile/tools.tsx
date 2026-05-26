import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

export default function ToolsScreen() {
    const router = useRouter();
    const { switchRole } = useTunzaaAuth();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleOpenSheet = () => {
        bottomSheetModalRef.current?.present();
    };

    const handleCloseSheet = () => {
        bottomSheetModalRef.current?.dismiss();
    };

    const handleSwitchAccount = async (role: string) => {
        handleCloseSheet();
        try {
            await switchRole(role);
            if (role === 'delivery') {
                router.replace('/(buyer)'); 
            }
        } catch (error) {
            console.error("Failed to switch role:", error);
        }
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    const renderToolItem = (label: string, onPress?: () => void) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <Text style={styles.itemLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tools</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderToolItem("Switch account type", handleOpenSheet)}
                {renderToolItem("Add new business branch", () => Alert.alert('Coming Soon', 'This feature is coming soon.'))}

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Tunzaa Version 2.0</Text>
                </View>
            </ScrollView>

            {/* Bottom Sheet for Account Switching */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={['35%']}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: '#FFFFFF' }}
                handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <TouchableOpacity style={styles.sheetItem} onPress={() => handleSwitchAccount('vendor')}>
                        <Text style={styles.sheetItemText}>Switch to sales product / services account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetItem} onPress={() => handleSwitchAccount('finance')}>
                        <Text style={styles.sheetItemText}>Switch to financial provider account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetItem} onPress={() => handleSwitchAccount('delivery')}>
                        <Text style={styles.sheetItemText}>Switch to Delivery services account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetItem} onPress={() => handleSwitchAccount('affiliate')}>
                        <Text style={styles.sheetItemText}>Switch to Affiliate Marketer account</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        paddingVertical: 10,
    },
    itemContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        // borderBottomWidth: 1,
        // borderBottomColor: '#F3F4F6',
    },
    itemLabel: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 40,
        alignItems: 'center',
        marginTop: 'auto',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    sheetContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    sheetItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    sheetItemText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    }
});

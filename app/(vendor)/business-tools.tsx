import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

export default function BusinessToolsScreen() {
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tools</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.menuList}>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleOpenSheet}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.menuTitle}>Switch account type</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon.')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.menuTitle}>Add new business branch</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Version Footer */}
            <View style={styles.footer}>
                <Text style={styles.versionText}>Tunzaa Version 2.0</Text>
            </View>

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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    menuList: {
        paddingHorizontal: 20,
    },
    menuItem: {
        paddingVertical: 24,
    },
    menuTitle: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '400',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '400',
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

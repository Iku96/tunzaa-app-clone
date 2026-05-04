import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, FileText, Fingerprint } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

export default function PoliciesScreen() {
    const router = useRouter();

    const handleOpenTerms = async () => {
        await WebBrowser.openBrowserAsync('https://tunzaa.co.tz/en/terms-of-service');
    };

    const handleOpenPrivacy = async () => {
        await WebBrowser.openBrowserAsync('https://tunzaa.co.tz/en/privacy-policy');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Policies</Text>
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
                        onPress={handleOpenTerms}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <FileText size={24} color="#111827" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuTitle}>Terms and condition</Text>
                        <ChevronRight size={20} color="#9CA3AF" strokeWidth={1.5} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleOpenPrivacy}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <Fingerprint size={24} color="#111827" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuTitle}>Privacy Centre</Text>
                        <ChevronRight size={20} color="#9CA3AF" strokeWidth={1.5} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
    },
    iconWrapper: {
        marginRight: 16,
        width: 32,
        alignItems: 'center',
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontWeight: '400',
    }
});


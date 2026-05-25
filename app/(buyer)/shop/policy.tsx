import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShop } from '../../../src/hooks/useShop';

export default function ShopPolicyScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { shop, loading, error } = useShop(id as string);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Shop Refund & Policy</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B5494" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !shop) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Shop Refund & Policy</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.errorText}>Could not load shop policies</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Use specific policies from metadata or fallbacks
    const refundPolicy = shop.return_policy || shop.metadata?.refund_policy || 'This shop has not specified a return timeframe.';
    const generalPolicy = shop.general_policy || shop.metadata?.general_policy || 'No specific refund method provided by this shop.';
    const shippingPolicy = shop.shipping_policy || shop.metadata?.shipping_policy || 'No return shipping policy provided by this shop.';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shop Refund & Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                
                <View style={styles.policySection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="refresh-circle" size={20} color="#6B7280" />
                        <Text style={styles.sectionTitle}>Refund Policy</Text>
                    </View>
                    
                    <View style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>⏱️</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bulletHighlight}>Timeframe:</Text> You can request a refund within 7 days of receiving your product.
                        </Text>
                    </View>
                    
                    <View style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>📦</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bulletHighlight}>Condition:</Text> Items must be unused, in original packaging, and in resellable condition.
                        </Text>
                    </View>
                    
                    <View style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>💳</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bulletHighlight}>Refund Method:</Text> {generalPolicy}
                        </Text>
                    </View>
                </View>

                <View style={styles.policySection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="ban-outline" size={18} color="#EF4444" />
                        <Text style={styles.sectionTitle}>Non-Refundable Items:</Text>
                    </View>
                    
                    <View style={styles.simpleBullet}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Personalized or custom-made products</Text>
                    </View>
                    <View style={styles.simpleBullet}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Clearance or final sale items</Text>
                    </View>
                    <View style={styles.simpleBullet}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Perishable goods</Text>
                    </View>
                </View>

                <View style={styles.policySection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="sync-circle" size={20} color="#6B7280" />
                        <Text style={styles.sectionTitle}>Return & Exchange Policy</Text>
                    </View>
                    
                    <View style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>📅</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bulletHighlight}>Return Window:</Text> {refundPolicy}
                        </Text>
                    </View>
                    
                    <View style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>🔄</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bulletHighlight}>Exchange Option:</Text> If your item is defective or damaged, we'll replace it free of charge.
                        </Text>
                    </View>
                    
                    <View style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>📮</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bulletHighlight}>Return Shipping:</Text> {shippingPolicy}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    policySection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingRight: 16,
    },
    bulletIcon: {
        fontSize: 16,
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
    },
    bulletHighlight: {
        color: '#4B5563',
        fontWeight: '500',
    },
    simpleBullet: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingLeft: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#9CA3AF',
        marginTop: 10,
        marginRight: 12,
    }
});

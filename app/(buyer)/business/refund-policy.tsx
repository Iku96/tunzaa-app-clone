import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopRefundPolicyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shop Refund & Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Refund Policy */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="receipt-outline" size={18} color="#4B5563" style={styles.iconMargin} />
                        <Text style={styles.sectionTitle}>Refund Policy</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>
                            <Text style={styles.boldText}>Timeframe:</Text> You can request a refund within 7 days of receiving your product.
                        </Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>
                            <Text style={styles.boldText}>Conditions:</Text> Items must be unused, in original packaging, and in resalable condition.
                        </Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>
                            <Text style={styles.boldText}>Refund Method:</Text> Approved refunds are processed via original payment method within 5-7 business days.
                        </Text>
                    </View>
                </View>

                {/* Non-Refundable Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="ban-outline" size={18} color="#EF4444" style={styles.iconMargin} />
                        <Text style={styles.sectionTitle}>Non-Refundable Items:</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>Personalized or custom-made products</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>Clearance or final sale items</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>Perishable goods</Text>
                    </View>
                </View>

                {/* Return & Exchange Policy */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="swap-horizontal" size={18} color="#4B5563" style={styles.iconMargin} />
                        <Text style={styles.sectionTitle}>Return & Exchange Policy</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>
                            <Text style={styles.boldText}>Return Window:</Text> Returns are accepted within 34 days of delivery.
                        </Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>
                            <Text style={styles.boldText}>Exchange Option:</Text> If your item is defective or damaged, we'll replace it free of charge.
                        </Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>
                            <Text style={styles.boldText}>Return Shipping:</Text> Customer covers return shipping unless the item was damaged or incorrect.
                        </Text>
                    </View>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconMargin: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingLeft: 4,
    },
    bullet: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 8,
        lineHeight: 20,
    },
    listText: {
        flex: 1,
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#374151',
    },
});

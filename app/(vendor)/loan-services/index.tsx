import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, Rocket, Layers } from 'lucide-react-native';
import { useGetLoanProducts, LoanProduct } from '@/src/services/loans';

export default function LoanServicesScreen() {
    const router = useRouter();
    const { data: loanProducts, isLoading, error } = useGetLoanProducts();

    // Helper to map string icon names to Lucide components
    const getIcon = (iconName: string, color: string, size: number) => {
        switch (iconName) {
            case 'Package': return <Package size={size} color={color} strokeWidth={1.5} />;
            case 'Rocket': return <Rocket size={size} color={color} strokeWidth={1.5} />;
            case 'Layers': return <Layers size={size} color={color} strokeWidth={1.5} />;
            default: return <Package size={size} color={color} strokeWidth={1.5} />;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Loan Services</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro Section */}
                <View style={styles.introSection}>
                    <Text style={styles.introTitle}>Access Financing Easily.</Text>
                    <Text style={styles.introSubtitle}>
                        Get the right financing option to grow your business
                    </Text>
                </View>

                {/* Loan Products List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#425BA4" />
                        <Text style={styles.loadingText}>Loading loan options...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Failed to load loan options. Please try again later.</Text>
                    </View>
                ) : (
                    <View style={styles.cardsContainer}>
                        {loanProducts?.map((product: LoanProduct) => (
                            <View key={product.id} style={styles.card}>
                                <View style={styles.cardTop}>
                                    <View style={styles.iconContainer}>
                                        {getIcon(product.icon_name, '#425BA4', 24)}
                                    </View>
                                    <View style={styles.cardTextContainer}>
                                        <Text style={styles.cardTitle}>{product.title}</Text>
                                        <Text style={styles.cardDescription}>{product.description}</Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.applyButton}
                                    onPress={() => router.push(`/(vendor)/loan-services/${product.id}/providers`)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.applyButtonText}>Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
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
        height: 60,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 32,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    introSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    introTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 8,
    },
    introSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 14,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        textAlign: 'center',
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    cardTop: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    applyButton: {
        backgroundColor: '#425BA4',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    }
});

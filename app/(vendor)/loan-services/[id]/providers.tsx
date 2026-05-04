import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useGetLoanProviders, LoanProvider } from '@/src/services/loans';

export default function LoanProvidersScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: providers, isLoading, error } = useGetLoanProviders(id as string);

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return `Tsh ${amount.toLocaleString()}`;
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
                    <Text style={styles.introSubtitle}>
                        Select a provider with the best terms for your business needs.
                    </Text>
                </View>

                {/* Providers List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#425BA4" />
                        <Text style={styles.loadingText}>Loading providers...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Failed to load providers. Please try again later.</Text>
                    </View>
                ) : (
                    <View style={styles.cardsContainer}>
                        {providers?.map((provider: LoanProvider) => (
                            <View key={provider.id} style={styles.card}>
                                <View style={styles.cardTop}>
                                    <Image 
                                        source={{ uri: provider.logo_url }} 
                                        style={styles.providerLogo}
                                    />
                                    <Text style={styles.providerName}>{provider.name}</Text>
                                </View>
                                
                                <View style={styles.detailsContainer}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Loan Term: </Text>
                                        <Text style={styles.detailValue}>{provider.loan_term}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Monthly Interest: </Text>
                                        <Text style={styles.detailValue}>{provider.monthly_interest}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Loan Amount: </Text>
                                        <Text style={styles.detailValue}>
                                            {formatCurrency(provider.min_amount)} - {formatCurrency(provider.max_amount)}
                                        </Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.applyButton}
                                    onPress={() => {
                                        router.push({
                                            pathname: `/(vendor)/loan-services/${id}/apply`,
                                            params: { providerId: provider.id }
                                        });
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.applyButtonText}>
                                        Apply with {provider.name.split(' ')[0]}
                                    </Text>
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
        paddingHorizontal: 16,
    },
    introSubtitle: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
        lineHeight: 22,
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
        alignItems: 'center',
        marginBottom: 16,
    },
    providerLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    detailsContainer: {
        marginBottom: 20,
        gap: 6,
    },
    detailRow: {
        flexDirection: 'row',
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 13,
        color: '#6B7280',
        flexShrink: 1,
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

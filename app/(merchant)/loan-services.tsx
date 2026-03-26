import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoanServicesScreen() {
    const router = useRouter();

    const PROVIDERS = [
        {
            id: 'aramex',
            name: 'Aramex Financial Services Limited',
            icon: 'business',
            term: '12months',
            interest: '5.00%',
            amount: 'Tsh 100,000 - Tsh 2,000,000',
            buttonText: 'Apply with Aramex Financial.'
        },
        {
            id: 'bill-electronics',
            name: 'Bill Electronics',
            icon: 'phone-portrait',
            term: '12months',
            interest: '5.00%',
            amount: 'Tsh 100,000 - Tsh 2,000,000',
            buttonText: 'Apply Bill Electronic'
        },
        {
            id: 'bill-finance',
            name: 'Bill Finance',
            icon: 'card',
            iconColor: '#059669',
            term: '3 months',
            interest: '10.00%',
            amount: 'Tsh 10,000 - Tsh 500,000',
            buttonText: 'Apply with Bill Finance'
        },
        {
            id: 'microsoft',
            name: 'MicroSoft Loan',
            icon: 'logo-medium',
            iconColor: '#000000',
            term: '3 months',
            interest: '10.00%',
            amount: 'Tsh 10,000 - Tsh 500,000',
            buttonText: 'Apply with Microsoft Loan'
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Loan Services</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.subtitle}>
                    Select a provider with the best terms for your business needs.
                </Text>

                {PROVIDERS.map((provider) => (
                    <View key={provider.id} style={styles.loanCard}>
                        <View style={styles.providerRow}>
                             <View style={styles.providerIconContainer}>
                                 <Ionicons name={provider.icon as any} size={24} color={provider.iconColor || "#3B5998"} />
                             </View>
                             <View style={styles.providerInfo}>
                                 <Text style={styles.providerName}>{provider.name}</Text>
                                 <Text style={styles.providerDetail}>Loan Term: {provider.term}</Text>
                                 <Text style={styles.providerDetail}>Monthly Interest: {provider.interest}</Text>
                                 <Text style={styles.providerDetail}>Loan Amount: {provider.amount}</Text>
                             </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.applyButton}
                            onPress={() => router.push({
                                pathname: '/(merchant)/loans/apply',
                                params: { provider: provider.name, interest: provider.interest, term: provider.term }
                            } as any)}
                        >
                            <Text style={styles.applyButtonText}>{provider.buttonText}</Text>
                        </TouchableOpacity>
                    </View>
                ))}

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
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginVertical: 24,
        paddingHorizontal: 10,
        lineHeight: 24,
    },
    loanCard: {
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    providerRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    providerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    providerDetail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    applyButton: {
        backgroundColor: '#3B5998',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    }
});

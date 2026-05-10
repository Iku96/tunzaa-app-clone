import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useSegments } from 'expo-router';
import { LayoutGrid, PlusSquare, MoreHorizontal, Calendar } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

import { API_CONFIG } from '@/src/services/config';
import { getAccessToken } from '@/src/utils/storage';

import CalendarModal from '@/src/components/merchant/CalendarModal';

export default function LoanDashboardScreen() {
    const router = useRouter();
    const segments = useSegments();
    const { user, isSidebarOpen, setIsSidebarOpen } = useTunzaaAuth();
    const [isChecking, setIsChecking] = useState(true);
    const [providerDetails, setProviderDetails] = useState<any>(null);
    const [localExtras, setLocalExtras] = useState<any>({});
    const [startDate, setStartDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(() => new Date());
    const [calendarMode, setCalendarMode] = useState<'start' | 'end' | null>(null);

    const [outstandingAmount, setOutstandingAmount] = useState<number>(0);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [totalCollectionsAmount, setTotalCollectionsAmount] = useState<number>(0);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const completedOnboarding = await AsyncStorage.getItem("HAS_COMPLETED_LOAN_ONBOARDING");
                const pendingOnboarding = await AsyncStorage.getItem("HAS_PENDING_LOAN_ONBOARDING");

                const loanProfile = user?.profiles?.find(
                    (p) => p.role?.toLowerCase() === 'loan' || p.role?.toLowerCase() === 'loan_provider'
                );

                const metadata = typeof loanProfile?.metadata === 'string'
                    ? JSON.parse(loanProfile.metadata)
                    : (loanProfile?.metadata || {});

                const isProfileIncomplete = !loanProfile || metadata?.onboarding_status === 'incomplete';

                if (completedOnboarding === "true") {
                    setIsChecking(false);
                } else if (isProfileIncomplete || pendingOnboarding === "true") {
                    setTimeout(() => {
                        router.replace("/(loan)/onboarding");
                    }, 0);
                } else {
                    setIsChecking(false);
                }
            } catch (e) {
                setIsChecking(false);
            }
        };

        if (user) {
            checkOnboarding();
        }
    }, [user, segments]);

    useEffect(() => {
        let isMounted = true;
        const fetchProvider = async () => {
            try {
                const userId = user?.user_id || user?.id;
                if (!userId) return;

                try {
                    const storedExtras = await AsyncStorage.getItem(`@tunzaa_business_extras_${userId}`);
                    if (storedExtras && isMounted) {
                        setLocalExtras(JSON.parse(storedExtras));
                    }
                } catch (err) {
                    console.warn('[LoanDashboard] Failed to load stored extras:', err);
                }

                const token = await getAccessToken();
                const response = await fetch(`${API_CONFIG.BASE_URL}/loans/providers/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok && isMounted) {
                    const providers = await response.json();
                    const myProvider = providers.find((p: any) => p.user_id === userId);
                    if (myProvider) {
                        setProviderDetails(myProvider);
                    }
                }

                // Fetch live Pending Requests
                try {
                    const reqResponse = await fetch(`${API_CONFIG.BASE_URL}/loans/provider-requests/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (reqResponse.ok && isMounted) {
                        const reqData = await reqResponse.json();
                        if (Array.isArray(reqData)) {
                            setPendingCount(reqData.length);
                        }
                    }
                } catch (e) {
                    console.warn('[LoanDashboard] Failed to fetch live pending requests:', e);
                }

                // Fetch live Collections & Outstanding Portfolio
                try {
                    const colResponse = await fetch(`${API_CONFIG.BASE_URL}/loans/repayments/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (colResponse.ok && isMounted) {
                        const colData = await colResponse.json();
                        if (Array.isArray(colData) && colData.length > 0) {
                            let totalPaid = 0;
                            let totalOut = 0;
                            colData.forEach((item: any) => {
                                totalPaid += item.amount_paid || item.collected_amount || 0;
                                totalOut += item.balance || item.remaining_balance || 0;
                            });
                            setTotalCollectionsAmount(totalPaid);
                            setOutstandingAmount(totalOut);
                        }
                    }
                } catch (e) {
                    console.warn('[LoanDashboard] Failed to fetch live collections:', e);
                }
            } catch (e) {
                console.warn('[LoanDashboard] Failed to fetch provider details:', e);
            }
        };
        if (user) {
            fetchProvider();
        }
        return () => { isMounted = false; };
    }, [user]);

    const loanProfileForName = user?.profiles?.find(
        (p) => p.role?.toLowerCase() === 'loan' || p.role?.toLowerCase() === 'loan_provider'
    );
    const metadataForName = typeof loanProfileForName?.metadata === 'string' ? JSON.parse(loanProfileForName.metadata) : (loanProfileForName?.metadata || {});

    let displayName = localExtras.business_name || providerDetails?.business_name || providerDetails?.name ||
        metadataForName?.business_name || metadataForName?.company_name ||
        loanProfileForName?.display_name || user?.display_name || "Loan Provider";

    if (displayName && /fast\s*cash/i.test(displayName)) {
        displayName = "Loan Provider";
    }

    if (!user || isChecking) return null;

    const toggleSidebar = () => {
        setIsSidebarOpen(true);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
                        <LayoutGrid size={24} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerRightRow}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(loan)/settings')}>
                            <MoreHorizontal size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Section Container */}
                <View style={styles.dateSectionContainer}>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.datePill} onPress={() => setCalendarMode('start')}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>
                                {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.dateDash}>-</Text>

                        <TouchableOpacity style={styles.datePill} onPress={() => setCalendarMode('end')}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>
                                {endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.reportText}>
                        Report : {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </Text>
                </View>

                {/* Calendar Modal */}
                <CalendarModal
                    isVisible={calendarMode !== null}
                    initialDate={calendarMode === 'start' ? startDate : endDate}
                    onClose={() => setCalendarMode(null)}
                    onSelectDate={(selectedDate) => {
                        if (calendarMode === 'start') {
                            setStartDate(selectedDate);
                            // Avoid end date being before start date
                            if (selectedDate > endDate) {
                                setEndDate(selectedDate);
                            }
                        } else {
                            setEndDate(selectedDate);
                            // Avoid start date being after end date
                            if (selectedDate < startDate) {
                                setStartDate(selectedDate);
                            }
                        }
                    }}
                />

                {/* Main Blue Analytics Card */}
                <View style={styles.mainBlueCard}>
                    <Text style={styles.mainCardSubtitle}>Outstanding Portfolio</Text>
                    <Text style={styles.mainCardTitle}>
                        Tsh. {outstandingAmount.toLocaleString()}
                    </Text>

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => router.push('/(loan)/history')}
                    >
                        <Text style={styles.historyButtonText}>View Loan History</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary Row */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Pending Requests</Text>
                        <Text style={styles.summaryTitle}>{pendingCount}</Text>
                        <TouchableOpacity
                            style={styles.viewDetailsBtn}
                            onPress={() => router.push('/(loan)/requests')}
                        >
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Collections</Text>
                        <Text style={styles.summaryTitle}>Tsh. {totalCollectionsAmount.toLocaleString()}</Text>
                        <TouchableOpacity
                            style={styles.viewDetailsBtn}
                            onPress={() => router.push('/(loan)/collections')}
                        >
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    dateSectionContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
        paddingRight: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    dateText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    },
    dateDash: {
        marginHorizontal: 12,
        color: '#111827',
        fontWeight: '500',
    },
    reportText: {
        fontSize: 10,
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        marginBottom: 10,
    },
    headerBtn: {
        padding: 8,
    },
    headerRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mainBlueCard: {
        backgroundColor: '#425BA4', // Tunzaa blueish hue
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    mainCardSubtitle: {
        color: '#E0E7FF',
        fontSize: 14,
        marginBottom: 12,
    },
    mainCardTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    historyButton: {
        borderWidth: 1,
        borderColor: '#93A5CF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
    },
    historyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'center',
    },
    summarySubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    viewDetailsBtn: {
        backgroundColor: '#01AC00', // Tunzaa Green
        borderRadius: 8,
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    welcomeContainer: {
        marginBottom: 16,
        marginTop: 10,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '400',
    },
    companyNameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 4,
        textDecorationLine: 'underline',
    },
});

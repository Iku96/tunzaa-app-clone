import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator, FlatList, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    MoreHorizontal, 
    CheckCircle2, 
    MapPin, 
    LayoutGrid,
    Share2,
    Play,
    UserCircle2,
    ChevronDown,
    Gem,
    PlusSquare,
    Sparkles,
    Calendar,
    Percent,
    X,
    Coins
} from 'lucide-react-native';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useGetLoanProducts } from '../../src/services/loans';
import { getAvatarUrl, getVendorLogoUrl } from '../../src/utils/images';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_CONFIG } from '../../src/services/config';
import { getAccessToken } from '../../src/utils/storage';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function LoanBusinessProfileScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth() as any;
    const [activeTab, setActiveTab] = useState('grid');
    const [providerDetails, setProviderDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(true);
    
    // Add Offer Modal state
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newTerm, setNewTerm] = useState('');
    const [newMinAmount, setNewMinAmount] = useState('');
    const [newMaxAmount, setNewMaxAmount] = useState('');

    // Local state for dynamically posted loan offers
    const [localOffers, setLocalOffers] = useState<any[]>([]);

    // Loan profile data
    const loanProfile = user?.profiles?.find(
        (p: any) => p.role?.toLowerCase() === 'loan' || p.role?.toLowerCase() === 'loan_provider'
    ) || {} as any;
    
    // Parse metadata safely
    const metadata = typeof loanProfile?.metadata === 'string' ? JSON.parse(loanProfile.metadata) : (loanProfile?.metadata || {});
    const branding = typeof loanProfile?.branding === 'string' ? JSON.parse(loanProfile.branding) : (loanProfile?.branding || {});
    const loanId = metadata?.vendor_id || loanProfile?.profile_id;

    // Fetch dynamic loan products (offers) from the API Hook
    const { data: apiProducts, isLoading: productsLoading } = useGetLoanProducts();

    // Combine API products and locally posted offers
    const loanProducts = [...localOffers, ...(apiProducts || [])];

    const [localExtras, setLocalExtras] = useState<any>({});

    // Fetch dynamic loan provider from the database API
    useFocusEffect(
        React.useCallback(() => {
            let isMounted = true;
            const fetchProvider = async () => {
                try {
                    const userId = user?.user_id || user?.id;
                    if (!userId) return;

                    // Load local profile changes instantly
                    try {
                        const storedExtras = await AsyncStorage.getItem(`@tunzaa_business_extras_${userId}`);
                        if (storedExtras && isMounted) {
                            setLocalExtras(JSON.parse(storedExtras));
                        }
                    } catch (err) {
                        console.warn('[LoanBusinessProfile] Failed to load stored extras:', err);
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
                } catch (e) {
                    console.warn('[LoanBusinessProfile] Failed to fetch provider details:', e);
                } finally {
                    if (isMounted) setLoadingDetails(false);
                }
            };
            fetchProvider();
            return () => { isMounted = false; };
        }, [user])
    );

    let displayName = localExtras.business_name || providerDetails?.business_name || providerDetails?.name || 
                         metadata?.business_name || metadata?.company_name || 
                         loanProfile?.display_name || user?.display_name || "Loan Provider";

    if (displayName && /fast\s*cash/i.test(displayName)) {
        displayName = "Loan Provider";
    }
    
    const logoUrl = localExtras.logo_url || providerDetails?.logo_url || metadata?.logo_url || getVendorLogoUrl({
        metadata,
        branding,
        vendorDetails: user?.vendorDetails,
    }) || '';
    
    // Location details from API provider metadata or local cache
    const locationRegion = localExtras.region || providerDetails?.metadata?.region || metadata?.region || 'Dar es salaam';
    const locationWard = localExtras.ward || providerDetails?.metadata?.ward || metadata?.ward || 'Kinondoni';
    const locationText = localExtras.location || [locationWard, locationRegion].filter(Boolean).join(', ');

    const formatStatCount = (val: any) => {
        if (val === undefined || val === null) return '0';
        const num = parseInt(typeof val === 'string' ? val.replace(/,/g, '') : val, 10);
        if (isNaN(num)) return val.toString();
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    };

    // Social stats - dynamically loaded from API provider metadata
    const postsCount = loanProducts.length;
    const followersCount = formatStatCount(providerDetails?.metadata?.followers_count || metadata?.followers_count || 0);
    const followingCount = formatStatCount(providerDetails?.metadata?.following_count || metadata?.following_count || 0);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/(loan)')} style={styles.headerBtn}>
                <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{displayName}</Text>
                <ChevronDown size={16} color="#111827" style={{ marginLeft: 4 }} />
                <View style={styles.activeDot} />
            </View>

            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsAddModalVisible(true)}>
                <PlusSquare size={24} color="#3A5BA9" />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.avatarWrapper}>
                <Avatar alt={displayName} style={styles.avatarContainer}>
                    <AvatarImage source={{ uri: getAvatarUrl(logoUrl, displayName) }} />
                    <AvatarFallback style={styles.avatarFallback}>
                        <UserCircle2 size={40} color="#E5E7EB" />
                    </AvatarFallback>
                </Avatar>
            </View>
            
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{postsCount}</Text>
                    <Text style={styles.statLabel}>Post</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{followersCount}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{followingCount}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </View>
            </View>
        </View>
    );

    const handleShare = async () => {
        try {
            const url = `https://tunzaa.co/loan-provider/${loanId || 'profile'}`;
            await Share.share({
                message: url,
                url: url
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderBio = () => (
        <View style={styles.bioContainer}>
            <View style={styles.nameRow}>
                <Text style={styles.businessName}>{displayName}</Text>
                <CheckCircle2 size={16} color="#10B981" style={{ marginLeft: 6 }} />
                <Text style={styles.verifiedText}>Verified</Text>
                
                <View style={styles.diamondBadge}>
                    <Gem size={12} color="#0EA5E9" style={{ marginRight: 4 }} />
                    <Text style={styles.diamondText}>Diamond</Text>
                </View>
            </View>
            
            <View style={styles.locationRow}>
                <MapPin size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.locationText}>{locationText}</Text>
            </View>
            
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={styles.editProfileBtn}
                    onPress={() => router.push('/(loan)/edit-profile')}
                >
                    <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Share2 size={20} color="#111827" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
                onPress={() => setActiveTab('grid')}
            >
                <LayoutGrid size={24} color={activeTab === 'grid' ? '#111827' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                onPress={() => setActiveTab('videos')}
            >
                <Play size={24} color={activeTab === 'videos' ? '#111827' : '#9CA3AF'} />
            </TouchableOpacity>
        </View>
    );

    const formatCurrency = (val: any) => {
        if (val === undefined || val === null) return '0';
        const cleanStr = typeof val === 'string' ? val.replace(/,/g, '') : val;
        const num = parseFloat(cleanStr);
        if (isNaN(num)) return val;
        return num.toLocaleString('en-US');
    };

    const formatInputCurrency = (text: string) => {
        const cleanText = text.replace(/\D/g, '');
        if (!cleanText) return '';
        return parseInt(cleanText, 10).toLocaleString('en-US');
    };

    const handlePostOffer = () => {
        if (!newTitle || !newDescription || !newInterest || !newTerm) {
            Alert.alert('Error', 'Tafadhali jaza taarifa zote');
            return;
        }

        const newOffer = {
            id: `local_${Date.now()}`,
            title: newTitle,
            description: newDescription,
            interest: newInterest,
            term: newTerm,
            minAmount: newMinAmount || '50,000',
            maxAmount: newMaxAmount || '1,000,000',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400'
        };

        setLocalOffers([newOffer, ...localOffers]);
        setIsAddModalVisible(false);
        setNewTitle('');
        setNewDescription('');
        setNewInterest('');
        setNewTerm('');
        setNewMinAmount('');
        setNewMaxAmount('');
        Alert.alert('Success', 'Umetuma ofa mpya kikamilifu!');
    };

    const renderLoanPostItem = ({ item }: { item: any }) => {
        const minVal = item.min_amount !== undefined ? item.min_amount : item.minAmount;
        const maxVal = item.max_amount !== undefined ? item.max_amount : item.maxAmount;
        const formattedMin = formatCurrency(minVal || 10000);
        const formattedMax = formatCurrency(maxVal || 2000000);

        const rawInterest = item.interest !== undefined ? item.interest : (item.interest_rate || '5.00');
        const formattedInterest = typeof rawInterest === 'string' && rawInterest.includes('%') ? rawInterest : `${rawInterest}%`;

        const rawTerm = item.term !== undefined ? item.term : (item.loan_term || '3');
        const formattedTerm = typeof rawTerm === 'string' && rawTerm.toLowerCase().includes('month') ? rawTerm : `${rawTerm} Months`;

        return (
            <View style={styles.offerCard}>
                <View style={styles.offerCardLeft}>
                    <View style={styles.offerIconWrapper}>
                        <Coins size={24} color="#3A5BA9" />
                    </View>
                </View>
                <View style={styles.offerCardRight}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDesc} numberOfLines={2}>{item.description}</Text>
                    
                    <View style={styles.offerMetaRow}>
                        <View style={styles.offerBadge}>
                            <Percent size={12} color="#059669" style={{ marginRight: 4 }} />
                            <Text style={styles.offerBadgeText}>{formattedInterest} Monthly</Text>
                        </View>
                        <View style={styles.offerBadge}>
                            <Calendar size={12} color="#2563EB" style={{ marginRight: 4 }} />
                            <Text style={styles.offerBadgeText}>{formattedTerm}</Text>
                        </View>
                    </View>

                    <View style={styles.amountRangeContainer}>
                        <Text style={styles.rangeLabel}>Available Limits:</Text>
                        <Text style={styles.rangeValue}>
                            {formattedMin} - {formattedMax} TZS
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            <ScrollView showsVerticalScrollIndicator={false}>
                {loadingDetails ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#3A5BA9" />
                    </View>
                ) : (
                    <>
                        {renderStats()}
                        {renderBio()}
                        {renderTabs()}
                        
                        {activeTab === 'grid' ? (
                            productsLoading ? (
                                <ActivityIndicator size="small" color="#3A5BA9" style={{ marginTop: 20 }} />
                            ) : loanProducts.length > 0 ? (
                                <FlatList
                                    data={loanProducts}
                                    renderItem={renderLoanPostItem}
                                    keyExtractor={item => item.id}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.listContent}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <LayoutGrid size={48} color="#D1D5DB" />
                                    <Text style={styles.emptyStateTitle}>No posts yet</Text>
                                    <Text style={styles.emptyStateSubtitle}>Share your first loan package to showcase your offers!</Text>
                                </View>
                            )
                        ) : (
                            <View style={styles.emptyState}>
                                <Play size={48} color="#D1D5DB" />
                                <Text style={styles.emptyStateTitle}>No promotional videos yet</Text>
                                <Text style={styles.emptyStateSubtitle}>Create promotional videos to engage your audience!</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Post Offer / Add Package Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Sparkles size={20} color="#3A5BA9" style={{ marginRight: 6 }} />
                            <Text style={styles.modalTitle}>Post New Loan Offer</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.closeBtn}>
                                <X size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
                            <Text style={styles.fieldLabel}>Offer Title / Jina la Ofa</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Business Booster Loan"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <Text style={styles.fieldLabel}>Description / Maelezo mafupi</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe the loan target and terms..."
                                value={newDescription}
                                onChangeText={setNewDescription}
                                multiline={true}
                                numberOfLines={3}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.fieldLabel}>Interest Rate (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 5%"
                                        value={newInterest}
                                        onChangeText={setNewInterest}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.fieldLabel}>Duration / Term</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 3 Months"
                                        value={newTerm}
                                        onChangeText={setNewTerm}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.fieldLabel}>Min Amount (TZS)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 50,000"
                                        value={newMinAmount}
                                        onChangeText={(val) => setNewMinAmount(formatInputCurrency(val))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.fieldLabel}>Max Amount (TZS)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 2,000,000"
                                        value={newMaxAmount}
                                        onChangeText={(val) => setNewMaxAmount(formatInputCurrency(val))}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handlePostOffer}>
                                <Text style={styles.submitBtnText}>Post Offer to Profile</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    avatarWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    avatarContainer: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#3A5BA9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    bioContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
        gap: 6,
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#10B981',
    },
    diamondBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0F2FE',
        marginLeft: 'auto',
    },
    diamondText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0369A1',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 13,
        color: '#4B5563',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editProfileBtn: {
        flex: 1,
        backgroundColor: '#3A5BA9',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    editProfileBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    shareBtn: {
        backgroundColor: '#F3F4F6',
        padding: 10,
        borderRadius: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
        marginTop: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#111827',
    },
    listContent: {
        padding: 16,
    },
    offerCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    offerCardLeft: {
        marginRight: 14,
        justifyContent: 'center',
    },
    offerIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offerCardRight: {
        flex: 1,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    offerDesc: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
        marginBottom: 10,
    },
    offerMetaRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    offerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    offerBadgeText: {
        fontSize: 11,
        color: '#374151',
        fontWeight: '500',
    },
    amountRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rangeLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginRight: 4,
    },
    rangeValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10B981',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6B7280',
        marginTop: 16,
    },
    emptyStateSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },
    loaderContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    },
    formContainer: {
        padding: 20,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    submitBtn: {
        backgroundColor: '#3A5BA9',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

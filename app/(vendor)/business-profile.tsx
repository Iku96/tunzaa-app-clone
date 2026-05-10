import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    MoreHorizontal, 
    CheckCircle2, 
    MapPin, 
    Briefcase,
    Image as ImageIcon,
    LayoutGrid,
    Share2,
    Play,
    UserCircle2,
    ChevronDown,
    PlusSquare
} from 'lucide-react-native';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useGetProducts } from '../../src/services/products';
import { useGetVendor } from '../../src/services/vendors';
import AddProductModal from '@/src/components/merchant/AddProductModal';
import { getAvatarUrl, getVendorLogoUrl } from '../../src/utils/images';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

const BUSINESS_EXTRAS_KEY = '@tunzaa_business_extras';

export default function BusinessProfileScreen() {
    const router = useRouter();
    const { user, setIsSidebarOpen } = useTunzaaAuth() as any;
    const [activeTab, setActiveTab] = useState('grid');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    
    // Vendor/Business profile data
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {} as any;
    
    // Parse metadata safely
    const metadata = typeof vendorProfile?.metadata === 'string' ? JSON.parse(vendorProfile.metadata) : (vendorProfile?.metadata || {});
    const branding = typeof vendorProfile?.branding === 'string' ? JSON.parse(vendorProfile.branding) : (vendorProfile?.branding || {});
    const vendorId = metadata?.vendor_id || vendorProfile?.profile_id;

    const [localExtras, setLocalExtras] = useState<any>({});

    // Load profile metadata from local storage as a fallback
    useFocusEffect(
        React.useCallback(() => {
            const loadProfileData = async () => {
                try {
                    const userId = user?.user_id || user?.id;
                    if (!userId) return;
                    const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${userId}`);
                    if (storedExtras) {
                        setLocalExtras(JSON.parse(storedExtras));
                    }
                } catch (e) {
                    console.warn('[BusinessProfile] Failed to load extras:', e);
                }
            };
            loadProfileData();
        }, [user])
    );
    
    // Fetch real products for this vendor
    const { data: productsData, isLoading: isLoadingProducts } = useGetProducts({ 
        vendor_id: vendorId,
        limit: 50 
    }, !!vendorId);

    // Fetch vendor store data for banners/promotional videos
    const { data: vendorData } = useGetVendor(vendorId, !!vendorId);
    const storeBanners = vendorData?.stores?.[0]?.banners || vendorData?.store?.banners || [];

    // Prioritize: API vendor data > Profile metadata > vendorDetails from auth context > Local Cache > Display Name > First Name
    const displayName = vendorData?.business_name || vendorData?.display_name || vendorData?.name ||
                         metadata?.business_name || metadata?.store_name || metadata?.company_name || 
                         user?.vendorDetails?.business_name || user?.vendorDetails?.name ||
                         localExtras.business_name || vendorProfile?.display_name || vendorProfile?.displayName || user?.first_name || '';
    const logoUrl = getVendorLogoUrl({
        vendorData,
        metadata,
        branding,
        vendorDetails: user?.vendorDetails,
        localExtras,
    }) || '';
    
    // KYC Status logic matching VendorLayout
    const kycMeta = (metadata?.verification_status || metadata?.kyc_status || metadata?.status || '').toLowerCase();
    const isVerified = 
        vendorProfile?.kyc?.verified === true || 
        ['approved', 'verified', 'active', 'completed'].includes(kycMeta) ||
        metadata?.is_verified === true ||
        metadata?.is_verified === 'true';

    // Joined date
    const joinedDate = user?.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : (vendorProfile?.created_at 
            ? new Date(vendorProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently');

    // Location from onboarding metadata
    const locationRegion = metadata?.region || metadata?.location?.region || '';
    const locationWard = metadata?.ward || metadata?.location?.ward || '';
    const locationText = [locationWard, locationRegion].filter(Boolean).join(', ') || 'Location not set';

    // Category
    const categoryText = metadata?.category || '';

    // Dynamic certificate count from verification_documents array
    const verificationDocs = metadata?.verification_documents || vendorProfile?.kyc?.documents || [];
    const certCount = Array.isArray(verificationDocs) ? verificationDocs.length : 0;
    
    let certText = 'No documents uploaded';
    if (certCount > 0) {
        let firstDocName = verificationDocs[0].name || '';
        if (!firstDocName) {
            const docStr = JSON.stringify(verificationDocs[0]).toLowerCase();
            if (docStr.includes('tin')) firstDocName = 'TIN Certificate';
            else if (docStr.includes('license')) firstDocName = 'Business License';
            else if (docStr.includes('brela')) firstDocName = 'BRELA Registration';
            else if (docStr.includes('nida')) firstDocName = 'NIDA';
            else {
                const firstDocType = verificationDocs[0].document_type_id || '';
                // Use type ID if it's a short string (not a UUID)
                firstDocName = (typeof firstDocType === 'string' && firstDocType.length > 0 && firstDocType.length < 20) 
                    ? (firstDocType.charAt(0).toUpperCase() + firstDocType.slice(1)) 
                    : 'Registration Document';
            }
        }
        
        if (certCount === 1) {
            certText = firstDocName;
        } else {
            certText = `${firstDocName} and ${certCount - 1} more`;
        }
    }

    // Social stats — dynamic posts count
    const postsCount = productsData?.total || metadata?.posts_count || 0;
    const followersCount = metadata?.followers_count || 0;
    const followingCount = metadata?.following_count || 0;
    const visitorsCount = vendorData?.stores?.[0]?.metadata?.profile_visitors || vendorData?.stores?.[0]?.extra_metadata?.profile_visitors || metadata?.profile_visitors || 0;

    // Map products to posts
    const posts = (productsData?.items || []).map(p => ({
        id: p.product_id,
        image: typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0] as any)?.url,
        isVideo: false,
        name: p.name
    })).filter(p => !!p.image);


    const renderHeader = () => (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4, marginBottom: 12, alignSelf: 'flex-start' }}>
                <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{user?.username || displayName}</Text>
                    <ChevronDown size={20} color="#111827" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.headerBtn}>
                        <LayoutGrid size={24} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(vendor)/settings')} style={styles.headerBtn}>
                        <MoreHorizontal size={24} color="#111827" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.avatarContainer}>
                <Avatar alt={displayName} className="w-20 h-20 border border-gray-100">
                    <AvatarImage source={{ uri: getAvatarUrl(logoUrl, displayName) }} />
                    <AvatarFallback className="bg-gray-50">
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
            const url = `https://tunzaa.co/shop/${vendorId}`;
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
                <CheckCircle2 size={16} color={isVerified ? "#10B981" : "#9CA3AF"} style={{ marginLeft: 6 }} />
                <Text style={[styles.verifiedText, { color: isVerified ? '#3A5BA9' : '#6B7280' }]}>
                    {isVerified ? 'Verified' : 'Pending'}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={[styles.infoText, { fontSize: 10, color: '#9CA3AF', marginBottom: 8 }]}>
                    ID: {vendorProfile?.profile_id || vendorProfile?.id || 'N/A'}
                </Text>
            </View>
            
            <View style={styles.infoRow}>
                <Briefcase size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.infoText}>Joined {joinedDate}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <MapPin size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.infoText}>{locationText}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <ImageIcon size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.infoText}>{certText}</Text>
            </View>
            
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={styles.editProfileBtn}
                    onPress={() => router.push('/(vendor)/edit-business')}
                >
                    <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Share2 size={20} color="#111827" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderInsightsCard = () => (
        <View style={styles.insightsCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Profile Visitor</Text>
            </View>
            <View style={styles.cardContent}>
                <TrendingUpIcon />
                <Text style={styles.cardMetrics}>{visitorsCount > 0 ? `${visitorsCount.toLocaleString()} visitors total` : 'No visitors recorded yet'}</Text>
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

    const renderGridItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.gridItem} 
            onPress={() => router.push({
                pathname: '/(vendor)/view-post',
                params: { postId: item.id }
            })}
        >
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            {item.isVideo && (
                <View style={styles.videoBadge}>
                    <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderStats()}
                {renderBio()}
                {renderInsightsCard()}
                {renderTabs()}
                
                {activeTab === 'grid' ? (
                    posts.length > 0 ? (
                        <FlatList
                            data={posts}
                            renderItem={renderGridItem}
                            keyExtractor={item => item.id}
                            numColumns={3}
                            scrollEnabled={false}
                            contentContainerStyle={styles.gridContent}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <LayoutGrid size={48} color="#D1D5DB" />
                            <Text style={styles.emptyStateTitle}>No posts yet</Text>
                            <Text style={styles.emptyStateSubtitle}>Share your first post to showcase your products!</Text>
                        </View>
                    )
                ) : (
                    storeBanners.length > 0 ? (
                        <FlatList
                            data={storeBanners}
                            renderItem={({ item }: { item: any }) => (
                                <TouchableOpacity style={styles.gridItem}>
                                    <Image source={{ uri: item.image_url }} style={styles.gridImage} />
                                    <View style={styles.videoBadge}>
                                        <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => item.banner_id || `banner-${index}`}
                            numColumns={3}
                            scrollEnabled={false}
                            contentContainerStyle={styles.gridContent}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Play size={48} color="#D1D5DB" />
                            <Text style={styles.emptyStateTitle}>No promotional videos yet</Text>
                            <Text style={styles.emptyStateSubtitle}>Create promotional content to engage your audience!</Text>
                        </View>
                    )
                )}
            </ScrollView>

            <AddProductModal 
                visible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                onSuccess={() => {
                    setIsAddModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}

const TrendingUpIcon = () => (
    <View style={styles.sparklineContainer}>
        <View style={[styles.sparklineBar, { height: 10, backgroundColor: '#10B981' }]} />
        <View style={[styles.sparklineBar, { height: 18, backgroundColor: '#10B981' }]} />
        <View style={[styles.sparklineBar, { height: 12, backgroundColor: '#10B981' }]} />
        <View style={[styles.sparklineBar, { height: 22, backgroundColor: '#10B981' }]} />
        <View style={[styles.sparklineBar, { height: 14, backgroundColor: '#10B981' }]} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
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
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#3A5BA9',
        marginLeft: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#4B5563',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
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
    insightsCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3A5BA9',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardMetrics: {
        fontSize: 12,
        color: '#10B981',
        marginLeft: 12,
    },
    sparklineContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    sparklineBar: {
        width: 3,
        borderRadius: 1.5,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
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
    gridContent: {
        paddingTop: 1,
    },
    gridItem: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH,
        padding: 1,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    videoBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 4,
        borderRadius: 4,
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
});

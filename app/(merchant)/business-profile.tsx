import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Search, 
    LayoutGrid, 
    MoreHorizontal, 
    CheckCircle2, 
    MapPin, 
    Calendar, 
    FileText, 
    Share2,
    Play,
    UserCircle2
} from 'lucide-react-native';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function BusinessProfileScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth() as any;
    const [activeTab, setActiveTab] = useState('grid');
    
    // Vendor/Business profile data
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {} as any;
    const metadata = vendorProfile?.metadata || {};
    const branding = vendorProfile?.branding || {};
    
    const displayName = metadata?.business_name || vendorProfile?.display_name || vendorProfile?.displayName || user?.first_name || '';
    const logoUrl = metadata?.logo_url || metadata?.image_url || branding?.logo_url;
    
    // Joined date — profile doesn't have created_at, so use user.created_at
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

    // Dynamic certificate count
    const certificates = [
        metadata?.business_license_url,
        metadata?.tin_certificate_url,
        metadata?.brela_certificate_url,
    ].filter(Boolean);
    const certCount = certificates.length;
    const certText = certCount > 0 
        ? `${certCount} document${certCount > 1 ? 's' : ''} uploaded`
        : 'No documents uploaded';

    // Social stats — will be dynamic when backend supports it
    const postsCount = metadata?.posts_count || 0;
    const followersCount = metadata?.followers_count || 0;
    const followingCount = metadata?.following_count || 0;

    // Posts — empty until backend provides endpoint
    const posts: any[] = [];


    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{displayName}</Text>
                <ArrowLeft size={16} color="#111827" style={{ transform: [{ rotate: '-90deg' }], marginLeft: 4 }} />
            </View>
            
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerBtn}>
                    <Search size={22} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn}>
                    <LayoutGrid size={22} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn}>
                    <MoreHorizontal size={22} color="#111827" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.avatarContainer}>
                {logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <UserCircle2 size={60} color="#E5E7EB" />
                    </View>
                )}
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

    const renderBio = () => (
        <View style={styles.bioContainer}>
            <View style={styles.nameRow}>
                <Text style={styles.businessName}>{displayName}</Text>
                <CheckCircle2 size={16} color="#3A5BA9" style={{ marginLeft: 6 }} />
                <Text style={styles.verifiedText}>Verified</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.infoText}>Joined {joinedDate}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <MapPin size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.infoText}>{locationText}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <FileText size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.infoText}>{certText}</Text>
            </View>
            
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={styles.editProfileBtn}
                    onPress={() => router.push('/(merchant)/edit-business')}
                >
                    <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn}>
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
                <Text style={styles.cardMetrics}>No insights available yet</Text>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
                onPress={() => setActiveTab('grid')}
            >
                <LayoutGrid size={24} color={activeTab === 'grid' ? '#3A5BA9' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'tagged' && styles.activeTab]}
                onPress={() => setActiveTab('tagged')}
            >
                <UserCircle2 size={24} color={activeTab === 'tagged' ? '#3A5BA9' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                onPress={() => setActiveTab('videos')}
            >
                <Play size={24} color={activeTab === 'videos' ? '#3A5BA9' : '#9CA3AF'} />
            </TouchableOpacity>
        </View>
    );

    const renderGridItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.gridItem} 
            onPress={() => router.push({
                pathname: '/(merchant)/view-post',
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
                
                {posts.length > 0 ? (
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
                )}
            </ScrollView>
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
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 38,
    },
    avatarPlaceholder: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 38,
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
        borderBottomColor: '#3A5BA9',
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

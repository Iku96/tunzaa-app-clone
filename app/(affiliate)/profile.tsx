import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreHorizontal, ChevronDown, MapPin, Share2, Grid, PlaySquare, CheckCircle } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useAffiliate } from '../../src/services/affiliate';

const { width } = Dimensions.get('window');
const imageSize = (width - 48 - 12) / 3;

export default function AffiliateProfileScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [activeTab, setActiveTab] = useState<'grid' | 'video'>('grid');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    // Fetch affiliate-specific data
    const userId = user?.user_id || user?.id || '';
    const { data: affiliate, isLoading } = useAffiliate(userId, !!userId);

    // Derive display values from auth context + affiliate data
    const displayName = affiliate?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Affiliate';
    const profilePicture = affiliate?.profile_picture || undefined;
    const affiliateStatus = affiliate?.status || 'pending';

    const handleBack = () => {
        router.push('/(affiliate)/' as any);
    };

    const handleInsights = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/customer-insights' as any);
    };

    const handleOrders = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/orders-sales' as any);
    };

    const handlePerformance = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/product-performance' as any);
    };

    const handleDashboard = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/' as any);
    };

    const handleWithdrawals = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/withdrawals' as any);
    };

    const toggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerTitleContainer} onPress={toggleMenu}>
                    <Text style={styles.headerTitle}>{displayName}</Text>
                    <ChevronDown size={16} color="#4B5563" style={{ marginLeft: 4 }} />
                    <View style={styles.onlineDot} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerBtn} onPress={toggleMenu}>
                    <MoreHorizontal size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Stats Section */}
                <View style={styles.statsSection}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {profilePicture ? (
                            <Image
                                source={{ uri: profilePicture }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarInitials}>
                                    {(user?.first_name?.[0] || '').toUpperCase()}{(user?.last_name?.[0] || '').toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Stats List */}
                    <View style={styles.statsList}>
                        <TouchableOpacity style={styles.statItem} onPress={handleInsights}>
                            <Text style={styles.statValue}>120</Text>
                            <Text style={styles.statLabel}>Post</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statItem} onPress={handleInsights}>
                            <Text style={styles.statValue}>30K</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statItem} onPress={handleInsights}>
                            <Text style={styles.statValue}>30K</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.nameRow}>
                        <Text style={styles.shopName}>{affiliate?.name || 'Gadget Shop'}</Text>
                        <View style={styles.verifiedBadge}>
                            <CheckCircle size={14} color="#059669" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>

                        <View style={styles.rankContainer}>
                            <Ionicons name="diamond" size={14} color="#06B6D4" />
                            <Text style={styles.rankText}>Diamond</Text>
                        </View>
                    </View>

                    <View style={styles.locationContainer}>
                        <MapPin size={14} color="#4B5563" />
                        <Text style={styles.locationText}>Kinondoni, Dar es salaam</Text>
                    </View>
                </View>

                {/* Profile Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareButton}>
                        <Share2 size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                {/* Content Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
                        onPress={() => setActiveTab('grid')}
                    >
                        <Grid size={24} color={activeTab === 'grid' ? '#111827' : '#9CA3AF'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'video' && styles.activeTab]}
                        onPress={() => setActiveTab('video')}
                    >
                        <PlaySquare size={24} color={activeTab === 'video' ? '#111827' : '#9CA3AF'} />
                    </TouchableOpacity>
                </View>

                {/* Grid Content */}
                {activeTab === 'grid' ? (
                    <View style={styles.gridContainer}>
                        {/* Mock image data */}
                        {[1, 2, 3].map((item) => (
                            <View key={item} style={styles.gridItem}>
                                <Image
                                    source={{ uri: `https://picsum.photos/seed/${item}/200` }}
                                    style={styles.gridImage}
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateText}>No videos yet.</Text>
                    </View>
                )}

            </ScrollView>

            {/* Navigation Menu Modal */}
            <Modal
                visible={isMenuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsMenuVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setIsMenuVisible(false)}
                >
                    <View style={styles.menuContent}>
                        <Text style={styles.menuHeader}>Affiliate Actions</Text>
                        
                        <TouchableOpacity style={styles.menuItem} onPress={handleDashboard}>
                            <Ionicons name="stats-chart" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>My Dashboard (Earnings))</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handlePerformance}>
                            <Ionicons name="cube" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Product Performance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleInsights}>
                            <Ionicons name="people" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Customer Insights</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleOrders}>
                            <Ionicons name="cart" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Orders and Sales</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleWithdrawals}>
                            <Ionicons name="cash" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Withdrawal history</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setIsMenuVisible(false)}>
                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Close Menu</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
    },
    headerBtn: {
        padding: 8,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981', // Green dot
        marginLeft: 8,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    statsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        marginRight: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B5998',
    },
    avatarInitials: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statsList: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#4B5563',
    },
    infoSection: {
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedText: {
        fontSize: 12,
        color: '#059669',
        marginLeft: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 4,
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto', // Pushes Diamond to the right
        paddingRight: 10,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#06B6D4', // Cyan
        marginLeft: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    editButton: {
        flex: 1,
        height: 44,
        backgroundColor: '#3B5998', // Tunzaa Blue
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginBottom: 2,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#111827',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 16,
    },
    gridItem: {
        width: imageSize,
        height: imageSize,
        marginBottom: 6,
        backgroundColor: '#F3F4F6', // Placeholder
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyStateText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    menuHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        marginLeft: 16,
    },
    menuDivider: {
        height: 1,
        width: '100%',
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    }
});

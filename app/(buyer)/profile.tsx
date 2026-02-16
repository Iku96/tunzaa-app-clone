import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSetupBanner from '../../src/components/profile/ProfileSetupBanner';
import ProductCard from '../../src/components/product/ProductCardVertical';
import { PRODUCTS as products } from '../../src/data/products';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();

    const handleShareProfile = () => {
        Alert.alert('Share Profile', 'Sharing functionality coming soon!');
    };

    const renderProductItem = ({ item }) => (
        <View style={{ width: 160, marginRight: 12 }}>
            <ProductCard product={item} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{profile?.full_name || 'User Profile'}</Text>
                <TouchableOpacity onPress={() => router.push('/(buyer)/profile/settings')} style={styles.iconButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Stats Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarRow}>
                        <View style={styles.statsContainer}>
                            <Image
                                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=eff6ff&color=425ba4` }}
                                style={styles.avatar}
                            />
                            <View style={styles.statsTextContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>30K</Text>
                                    <Text style={styles.statLabel}>Followers</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>30K</Text>
                                    <Text style={styles.statLabel}>Following</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{profile?.full_name || 'Tunzaa User'}</Text>
                            {/* Verified Badge Placeholder */}
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color="#6B7280" />
                            <Text style={styles.locationText}>{profile?.region ? `${profile.region}, ${profile.district}` : 'Dar es Salaam'}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.editProfileButton}
                            onPress={() => router.push('/(buyer)/profile/edit')}
                        >
                            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
                            <Ionicons name="share-social-outline" size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Setup Banner */}
                <View style={styles.bannerContainer}>
                    <ProfileSetupBanner progress={0.6} points={53} onPress={() => router.push('/(buyer)/profile/edit')} />
                </View>

                {/* Recommended Section */}
                <View style={styles.recommendedSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        horizontal
                        data={products.slice(0, 5)}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.productsList}
                    />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        paddingBottom: 40,
    },
    profileSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        marginRight: 24,
    },
    statsTextContainer: {
        flexDirection: 'row',
        gap: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    userInfo: {
        marginBottom: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    verifiedBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    verifiedText: {
        fontSize: 10,
        color: '#0284C7',
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editProfileButton: {
        flex: 1,
        backgroundColor: '#1E3A8A', // Dark blue
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editProfileButtonText: {
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
    },
    bannerContainer: {
        marginBottom: 24,
    },
    recommendedSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3A8A', // Blue color for title based on screenshot
    },
    seeAllText: {
        fontSize: 12,
        color: '#6B7280',
    },
    productsList: {
        paddingRight: 20,
    },
});

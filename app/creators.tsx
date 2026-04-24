import { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../src/contexts/TunzaaAuthContext';
import { shopsApi } from '../src/services/shops';
import { getOnboardingCache, clearOnboardingCache } from '../src/utils/onboardingStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/services/config';

interface Business {
    id: string;
    name: string;
    description?: string;
}

export default function CreatorsScreen() {
    const router = useRouter();
    const { user, updateUser } = useTunzaaAuth();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [followedIds, setFollowedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const data = await shopsApi.getStores();
            setBusinesses(Array.isArray(data) ? data : (data as any)?.results || []);
        } catch (error: any) {
            console.log('Failed to load businesses:', error);
            // Gracefully handle — show empty state instead of alert
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (businessId: string) => {
        if (!user) return;

        // Toggle follow state locally (API integration can be added later)
        if (followedIds.includes(businessId)) {
            setFollowedIds(followedIds.filter(id => id !== businessId));
        } else {
            setFollowedIds([...followedIds, businessId]);
        }
    };

    const handleContinueOrSkip = async () => {
        try {
            setSubmitting(true);
            
            // 1. Fetch entire accumulated onboarding cache
            const cache = await getOnboardingCache();
            const profileData = cache?.profile || {};
            const interests = cache?.interests || [];
            
            console.log('📦 [Onboarding] Final Batched Commit to API');
            
            // 2. We use 'updateUser' because backend lacks dedicated structured columns for gender/dob yet.
            // WARNING: Metadata Backup (Tracked for future structured DB columns)
            await updateUser({
                metadata: {
                    ...user?.profiles?.[0]?.metadata,
                    gender: profileData.gender,
                    dateOfBirth: profileData.dateOfBirth,
                    location: profileData.location,
                    interests: interests,
                    // "Follows" metadata placeholder until POST /user/follow exists
                    follows: followedIds,
                }
            });
            
            // 3. Clear cache & Route Home safely
            await clearOnboardingCache();
            await AsyncStorage.removeItem(STORAGE_KEYS.IS_FIRST_TIME_BUYER);
            router.replace('/(buyer)');
        } catch (e) {
            console.error('Final Onboarding Commit Failed:', e);
            alert('Could not finish onboarding. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getColorForName = (name: string) => {
        const colors = ['#425BA4', '#E60000', '#FF6B6B', '#2C2C2C', '#FF69B4', '#4ECDC4', '#D9D9D9', '#0066CC'];
        const hash = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Follow interesting profiles</Text>
            </View>
            <View style={styles.headerDivider} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#666666"
                    />
                </View>

                {/* Discover businesses */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Discover businesses</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.horizontalScroll}
                    >
                        {businesses.slice(0, 6).map(business => (
                            <View key={business.id} style={styles.profileItem}>
                                <View style={styles.profileImageContainer}>
                                    <View style={[
                                        styles.profileImageCircle,
                                        { backgroundColor: getColorForName(business.name) }
                                    ]}>
                                        <Text style={styles.initialsText}>{getInitials(business.name)}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.plusBadge,
                                            followedIds.includes(business.id) && styles.plusBadgeActive
                                        ]}
                                        onPress={() => handleFollow(business.id)}
                                    >
                                        <Ionicons
                                            name={followedIds.includes(business.id) ? "checkmark" : "add"}
                                            size={12}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.profileLabel}>{business.name}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity 
                    style={styles.skipButton} 
                    onPress={handleContinueOrSkip}
                    disabled={submitting}
                >
                    <Text style={[styles.skipText, submitting && { opacity: 0.5 }]}>
                        {submitting ? 'Saving...' : (followedIds.length > 0 ? 'Continue' : 'Skip')}
                    </Text>
                    {!submitting && <Ionicons name="arrow-forward" size={16} color="#425BA4" />}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        fontFamily: 'System',
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1E1F',
        flex: 1,
    },
    headerDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    searchContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
    },
    searchInput: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        fontFamily: 'System',
        fontSize: 14,
        color: '#1D1E1F',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1E1F',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    horizontalScroll: {
        paddingHorizontal: 16,
    },
    profileItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 80,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    profileImageCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        fontFamily: 'System',
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    plusBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#425BA4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    plusBadgeActive: {
        backgroundColor: '#22C55E',
    },
    profileLabel: {
        fontFamily: 'System',
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 6,
        marginTop: 32,
        paddingVertical: 12,
    },
    skipText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500',
        color: '#425BA4',
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data for stories
const STORIES = [
    {
        id: '1',
        vendor: {
            name: 'Vodacom Shop',
            isVerified: true,
            logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&auto=format&fit=crop&q=60' // Mock red logo
        },
        caption: 'Summer vibes with our new denim collection. Perfect for those sunny days ahead! #SummerStyle',
        mediaType: 'video', // we mock the visual play button
        mediaUrl: 'https://images.unsplash.com/photo-1608223652643-fc69128522e8?w=500&auto=format&fit=crop&q=60', // Mock router/speaker image
        paginationDots: 3,
        activeDot: 1,
        stats: {
            likes: '2.3K',
            comments: '2.3K',
            shares: '2.3K'
        }
    },
    {
        id: '2',
        vendor: {
            name: 'Vodacom Shop',
            isVerified: true,
            logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&auto=format&fit=crop&q=60'
        },
        caption: 'Summer vibes with our new denim collection. Perfect for those sunny days ahead! #SummerStyle',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60', // Mock TV image
        paginationDots: 0,
        activeDot: 0,
        stats: {
            likes: '1.2K',
            comments: '800',
            shares: '1.2K'
        }
    }
];

export default function ProductStoriesScreen() {
    const router = useRouter();

    const renderStoryCard = (story: typeof STORIES[0]) => (
        <View key={story.id} style={styles.storyCard}>

            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.vendorLogoContainer}>
                    <View style={styles.innerRedCircle} />
                </View>
                <View style={styles.headerTextContainer}>
                    <View style={styles.vendorNameRow}>
                        <Text style={styles.vendorName}>{story.vendor.name}</Text>
                        {story.vendor.isVerified && (
                            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                        )}
                    </View>
                    <Text style={styles.captionText}>{story.caption}</Text>
                </View>
            </View>

            {/* Media Area */}
            <View style={styles.mediaContainer}>
                <Image source={{ uri: story.mediaUrl }} style={styles.mediaImage} />

                {/* Overlay Icons */}
                <TouchableOpacity style={styles.volumeIcon}>
                    <Ionicons name="volume-mute-outline" size={20} color="#D1D5DB" />
                </TouchableOpacity>

                {story.mediaType === 'video' && (
                    <View style={styles.playButtonOverlay}>
                        <Ionicons name="play" size={24} color="#425BA4" style={styles.playIcon} />
                    </View>
                )}

                {/* Pagination Dots over media */}
                {story.paginationDots > 0 && (
                    <View style={styles.paginationRow}>
                        {Array.from({ length: story.paginationDots }).map((_, idx) => (
                            <View
                                key={idx}
                                style={[styles.dot, idx === story.activeDot ? styles.activeDot : {}]}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Buy Now Strip attached to Media */}
            <TouchableOpacity style={styles.buyNowStrip}>
                <Text style={styles.buyNowText}>Buy Now</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Engagement Row */}
            <View style={styles.engagementRow}>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="heart" size={24} color="#EF4444" />
                    <Text style={styles.actionText}>{story.stats.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
                    <Text style={styles.actionText}>{story.stats.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="paper-plane-outline" size={24} color="#1F2937" />
                    <Text style={styles.actionText}>{story.stats.shares}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cardDivider} />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Main Header */}
            <View style={styles.mainHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.mainTitle}>Product Stories</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.feedContainer} showsVerticalScrollIndicator={false}>
                {STORIES.map(renderStoryCard)}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mainHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    mainTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    feedContainer: {
        paddingBottom: 40,
    },
    storyCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 16,
    },
    vendorLogoContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EF4444', // Outer Red Ring
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    innerRedCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF', // Creates the "O" effect from the screenshot
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    vendorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    vendorName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    captionText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    mediaContainer: {
        width: '100%',
        aspectRatio: 1, // Square media container
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    volumeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    playButtonOverlay: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    playIcon: {
        marginLeft: 4, // Visual center tweak for play triangle
    },
    paginationRow: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    activeDot: {
        width: 16, // Pill shape
        backgroundColor: '#425BA4',
    },
    buyNowStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#425BA4',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    buyNowText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    engagementRow: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 24,
        gap: 24,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    cardDivider: {
        height: 8,
        backgroundColor: '#F3F4F6',
    },
});

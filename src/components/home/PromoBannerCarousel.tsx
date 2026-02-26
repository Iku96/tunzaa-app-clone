import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    ViewToken,
} from 'react-native';
import type { Banner } from '../../services/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40; // 20px margin on each side
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

// Fallback banners when no server data is available
const FALLBACK_BANNERS: Banner[] = [
    {
        banner_id: 'fallback-1',
        title: 'UP TO 80% OFF',
        image_url: 'https://images.unsplash.com/photo-1598327770691-7f0ad7d76b16?w=500&auto=format&fit=crop&q=60',
        mobile_image_url: null,
        destination_url: null,
        alt_text: 'Big sale on electronics',
        display_order: 0,
        is_active: true,
        start_date: '',
        end_date: '',
    },
    {
        banner_id: 'fallback-2',
        title: 'NEW ARRIVALS',
        image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=60',
        mobile_image_url: null,
        destination_url: null,
        alt_text: 'Check out new arrivals',
        display_order: 1,
        is_active: true,
        start_date: '',
        end_date: '',
    },
    {
        banner_id: 'fallback-3',
        title: 'FREE DELIVERY',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        mobile_image_url: null,
        destination_url: null,
        alt_text: 'Free delivery this weekend',
        display_order: 2,
        is_active: true,
        start_date: '',
        end_date: '',
    },
];

// Background gradient colors for each banner slide
const BANNER_COLORS = ['#6366F1', '#4338CA', '#7C3AED', '#2563EB', '#0891B2'];

interface PromoBannerCarouselProps {
    banners?: Banner[];
    loading?: boolean;
}

export default function PromoBannerCarousel({ banners, loading }: PromoBannerCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const displayBanners = banners && banners.length > 0 ? banners : FALLBACK_BANNERS;

    // Auto-scroll
    const startAutoScroll = useCallback(() => {
        if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
        if (displayBanners.length <= 1) return;

        autoScrollTimer.current = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % displayBanners.length;
                flatListRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, AUTO_SCROLL_INTERVAL);
    }, [displayBanners.length]);

    useEffect(() => {
        startAutoScroll();
        return () => {
            if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
        };
    }, [startAutoScroll]);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index != null) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewability = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleBannerPress = (banner: Banner) => {
        if (banner.destination_url) {
            Linking.openURL(banner.destination_url).catch(() => { });
        }
    };

    // Reset auto-scroll on manual swipe
    const handleScrollBeginDrag = () => {
        if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };

    const handleScrollEndDrag = () => {
        startAutoScroll();
    };

    const renderBanner = ({ item, index }: { item: Banner; index: number }) => {
        const bgColor = BANNER_COLORS[index % BANNER_COLORS.length];
        const imageUrl = item.mobile_image_url || item.image_url;

        return (
            <TouchableOpacity
                activeOpacity={item.destination_url ? 0.85 : 1}
                onPress={() => handleBannerPress(item)}
                style={[styles.bannerSlide, { backgroundColor: bgColor }]}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    {item.alt_text && item.alt_text !== item.title && (
                        <Text style={styles.bannerSubtitle} numberOfLines={2}>{item.alt_text}</Text>
                    )}
                </View>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.bannerImage}
                    resizeMode="contain"
                />
                <View style={styles.bannerDecor} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="small" color="#6366F1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={displayBanners}
                renderItem={renderBanner}
                keyExtractor={(item) => item.banner_id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={BANNER_WIDTH}
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewability}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                getItemLayout={(_, index) => ({
                    length: BANNER_WIDTH,
                    offset: BANNER_WIDTH * index,
                    index,
                })}
                contentContainerStyle={{ gap: 0 }}
            />
            {/* Dot indicators */}
            {displayBanners.length > 1 && (
                <View style={styles.dotsContainer}>
                    {displayBanners.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === activeIndex ? styles.dotActive : styles.dotInactive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    loadingContainer: {
        height: 160,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerSlide: {
        width: BANNER_WIDTH,
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative',
        // Shadow
        shadowColor: '#4A55A2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    bannerContent: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        zIndex: 2,
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        width: 170,
        lineHeight: 34,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 6,
        width: 160,
    },
    bannerImage: {
        width: 160,
        height: 180,
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    bannerDecor: {
        position: 'absolute',
        top: -60,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    dot: {
        borderRadius: 4,
        height: 8,
    },
    dotActive: {
        width: 24,
        backgroundColor: '#4A55A2',
    },
    dotInactive: {
        width: 8,
        backgroundColor: '#D1D5DB',
    },
});

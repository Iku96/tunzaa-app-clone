import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    MoreHorizontal, 
    CheckCircle2, 
    Heart, 
    MessageCircle, 
    Send,
    Play,
    Volume2,
    VolumeX
} from 'lucide-react-native';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

export default function ViewPostScreen() {
    const router = useRouter();
    const { postId } = useLocalSearchParams();
    const { user } = useTunzaaAuth() as any;
    const [isMuted, setIsMuted] = useState(true);
    const [liked, setLiked] = useState(false);
    
    // Vendor data
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {} as any;
    const metadata = vendorProfile?.metadata || {};
    const displayName = metadata?.business_name || vendorProfile?.display_name || user?.first_name || '';
    const logoUrl = metadata?.logo_url || vendorProfile?.branding?.logo_url;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            {logoUrl ? (
                                <Image source={{ uri: logoUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitials}>VS</Text>
                                </View>
                            )}
                        </View>
                        <View>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>{displayName}</Text>
                                <CheckCircle2 size={14} color="#3A5BA9" style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={styles.postTime}>Just now</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <MoreHorizontal size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Post Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        {metadata?.description || 'No description available.'}
                    </Text>
                </View>

                {/* Post Media (Placeholder until backend provides images) */}
                <View style={styles.mediaContainer}>
                    {logoUrl ? (
                        <Image 
                            source={{ uri: logoUrl }} 
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.postImage, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>No image available</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.playOverlay}>
                        <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.muteBtn}
                        onPress={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <VolumeX size={20} color="#FFFFFF" /> : <Volume2 size={20} color="#FFFFFF" />}
                    </TouchableOpacity>
                    
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                {/* Action Row */}
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={styles.insightBtn}
                        onPress={() => router.push('/(merchant)/product-insight')}
                    >
                        <Text style={styles.insightBtnText}>View Insights</Text>
                    </TouchableOpacity>
                </View>

                {/* Engagement Row */}
                <View style={styles.engagementRow}>
                    <View style={styles.engagementItem}>
                        <TouchableOpacity onPress={() => setLiked(!liked)}>
                            <Heart size={24} color={liked ? "#EF4444" : "#111827"} fill={liked ? "#EF4444" : "none"} />
                        </TouchableOpacity>
                        <Text style={styles.engagementCount}>0</Text>
                    </View>
                    <View style={styles.engagementItem}>
                        <TouchableOpacity>
                            <MessageCircle size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.engagementCount}>0</Text>
                    </View>
                    <View style={styles.engagementItem}>
                        <TouchableOpacity>
                            <Send size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.engagementCount}>0</Text>
                    </View>
                </View>

                {/* Merchant Bio Summary */}
                <View style={styles.merchantSummary}>
                    <View style={styles.summaryHeader}>
                        <View style={styles.summaryAvatarContainer}>
                            {logoUrl ? (
                                <Image source={{ uri: logoUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder} />
                            )}
                        </View>
                        <View>
                            <View style={styles.nameRow}>
                                <Text style={styles.summaryName}>{displayName}</Text>
                                <CheckCircle2 size={14} color="#3A5BA9" style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={styles.summaryBio}>
                                {metadata?.description || 'No description available.'}
                            </Text>
                        </View>
                    </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EF4444', 
        padding: 2,
        marginRight: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    avatarPlaceholder: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    postTime: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    descriptionContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#374151',
    },
    hashtag: {
        color: '#3A5BA9',
        fontWeight: '500',
    },
    mediaContainer: {
        width: width,
        height: width,
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -30,
        marginLeft: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    muteBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8,
        borderRadius: 20,
    },
    pagination: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
        backgroundColor: '#3A5BA9',
        width: 14,
    },
    actionRow: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    insightBtn: {
        alignSelf: 'flex-start',
    },
    insightBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    engagementRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 20,
        paddingBottom: 24,
    },
    engagementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    engagementCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    merchantSummary: {
        padding: 16,
        borderTopWidth: 8,
        borderTopColor: '#F9FAFB',
    },
    summaryHeader: {
        flexDirection: 'row',
    },
    summaryAvatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#EF4444',
        padding: 2,
        marginRight: 10,
    },
    summaryName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    summaryBio: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
        maxWidth: width - 80,
    },
    adContainer: {
        width: width,
        height: width * 0.6,
        backgroundColor: '#000',
        position: 'relative',
        marginTop: 10,
    },
    adImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    adOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    adBrandLogo: {
        width: 40,
        height: 24,
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        padding: 2,
    },
    adTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    adTag: {
        position: 'absolute',
        top: 20,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    adTagText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

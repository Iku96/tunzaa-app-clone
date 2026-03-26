import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Heart, 
    MessageCircle, 
    Send,
    Play
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProductInsightScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Insight</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Media Selection */}
                <View style={styles.mediaContainer}>
                    <View style={styles.imageWrapper}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }} 
                            style={styles.productThumbnail}
                        />
                        <View style={styles.playBadge}>
                            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                        </View>
                    </View>
                </View>

                {/* Engagement Quick Stats */}
                <View style={styles.quickEngagement}>
                    <View style={styles.engagementItem}>
                        <Heart size={22} color="#111827" />
                        <Text style={styles.engagementText}>0</Text>
                    </View>
                    <View style={styles.engagementItem}>
                        <MessageCircle size={22} color="#111827" />
                        <Text style={styles.engagementText}>0</Text>
                    </View>
                    <View style={styles.engagementItem}>
                        <Send size={22} color="#111827" />
                        <Text style={styles.engagementText}>0</Text>
                    </View>
                </View>

                {/* Overview Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Accounts Reached</Text>
                        <Text style={styles.metricValue}>0</Text>
                    </View>
                    
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Engagement</Text>
                        <Text style={styles.metricValue}>0</Text>
                    </View>
                    
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Product Conversion</Text>
                        <Text style={styles.metricValue}>0</Text>
                    </View>
                </View>

                {/* Reach Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reach</Text>
                    
                    {/* Follower Breakdown Bar */}
                    <View style={styles.reachBarContainer}>
                        <View style={styles.reachBarLabels}>
                            <Text style={styles.reachBarPercent}>0%</Text>
                            <Text style={styles.reachBarPercent}>0%</Text>
                        </View>
                        <View style={styles.reachProgressBar}>
                            <View style={[styles.reachProgressMain, { width: '0%' }]} />
                            <View style={[styles.reachProgressSub, { width: '0%' }]} />
                        </View>
                        <View style={styles.reachBarLabels}>
                            <Text style={styles.reachBarLabel}>Followers</Text>
                            <Text style={styles.reachBarLabel}>Non - followers</Text>
                        </View>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Impression</Text>
                        <Text style={styles.metricValue}>0</Text>
                    </View>
                    
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>View</Text>
                        <Text style={styles.metricValue}>0</Text>
                    </View>
                    
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Profile</Text>
                        <Text style={styles.metricValue}>0</Text>
                    </View>
                </View>

                {/* Engagement Breakdown Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Engagement</Text>
                    
                    <View style={styles.reachBarContainer}>
                        <View style={styles.reachBarLabels}>
                            <Text style={styles.reachBarPercent}>0%</Text>
                            <Text style={styles.reachBarPercent}>0%</Text>
                        </View>
                        <View style={[styles.reachProgressBar, { backgroundColor: '#E5E7EB' }]}>
                            <View style={[styles.reachProgressMain, { width: '0%' }]} />
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
    mediaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    imageWrapper: {
        width: 120,
        height: 180,
        position: 'relative',
    },
    productThumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'contain',
    },
    playBadge: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -15,
        marginLeft: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickEngagement: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        paddingBottom: 30,
    },
    engagementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    engagementText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    metricLabel: {
        fontSize: 15,
        color: '#4B5563',
    },
    metricValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    reachBarContainer: {
        marginBottom: 24,
    },
    reachBarLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reachBarPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    reachBarLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
    },
    reachProgressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F3F4F6',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    reachProgressMain: {
        height: '100%',
        backgroundColor: '#3A5BA9',
    },
    reachProgressSub: {
        height: '100%',
        backgroundColor: '#E5E7EB',
    }
});

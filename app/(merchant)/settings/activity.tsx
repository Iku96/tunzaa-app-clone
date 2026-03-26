import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    ShoppingBag, 
    Heart, 
    Send, 
    Bookmark, 
    Grid, 
    CreditCard, 
    Clock, 
    Search,
    ChevronRight 
} from 'lucide-react-native';

export default function ActivitySettingsScreen() {
    const router = useRouter();

    const ActivityItem = ({ icon: Icon, label, onPress, isLast = false }: any) => (
        <TouchableOpacity 
            style={[styles.itemContainer, isLast && styles.lastItem]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                    <Icon size={22} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Activity</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.overviewTextContainer}>
                    <Text style={styles.overviewText}>Your Tunzaa Activity Overview</Text>
                </View>

                <SectionHeader title="Purchased" />
                <ActivityItem 
                    icon={ShoppingBag} 
                    label="Shopping activity" 
                    onPress={() => router.push('/(merchant)/settings/spending-activity')} 
                />

                <SectionHeader title="Engagement" />
                <ActivityItem 
                    icon={Heart} 
                    label="Likes" 
                    onPress={() => router.push('/(merchant)/settings/likes')}
                />
                <ActivityItem 
                    icon={Send} 
                    label="Shared" 
                    onPress={() => router.push('/(merchant)/settings/share')}
                />
                <ActivityItem 
                    icon={Bookmark} 
                    label="Wishlist" 
                    onPress={() => router.push('/(merchant)/settings/wishlist')}
                />

                <SectionHeader title="Content" />
                <ActivityItem 
                    icon={Grid} 
                    label="Post" 
                    onPress={() => router.push('/(merchant)/settings/posts-feed')}
                />

                <SectionHeader title="Payment" />
                <ActivityItem 
                    icon={CreditCard} 
                    label="Orders and payment" 
                    onPress={() => router.push('/(merchant)/settings/orders')}
                />

                <SectionHeader title="How you use Tunzaa" />
                <ActivityItem 
                    icon={Clock} 
                    label="Time spent" 
                    onPress={() => router.push('/(merchant)/settings/time-usage')}
                />
                <ActivityItem 
                    icon={Search} 
                    label="Recent search" 
                    isLast={true} 
                    onPress={() => router.push('/(merchant)/settings/recent-search')} 
                />
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
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    overviewTextContainer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    overviewText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '400',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4B5563',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '400',
    },
});

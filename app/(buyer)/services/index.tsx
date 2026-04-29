import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

const TEASER_SERVICES = [
    { id: '1', name: 'Flights', icon: 'airplane-outline', description: 'Book local & international flights' },
    { id: '2', name: 'Hotels', icon: 'bed-outline', description: 'Luxury stays across Tanzania' },
    { id: '3', name: 'Loans', icon: 'cash-outline', description: 'Quick access to credit & financing' },
    { id: '4', name: 'Gift Cards', icon: 'gift-outline', description: 'Perfect gifts for your loved ones' },
    { id: '5', name: 'Tickets', icon: 'ticket-outline', description: 'Events, bus & train tickets' },
];

export default function ServicesScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();

    const displayName = user
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        : 'User';
    const displayImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=4A55A2`;

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.userInfo} onPress={() => router.push('/(buyer)/profile')}>
                            <Image source={{ uri: displayImage }} style={styles.avatar} />
                            <View>
                                <Text style={styles.greeting}>Welcome</Text>
                                <Text style={styles.userName}>{displayName} 👋</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(buyer)/notifications')}>
                            <Ionicons name="notifications-outline" size={24} color="#425BA4" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Tunzaa Services</Text>
                        <Text style={styles.headerSubtitle}>Expanding your lifestyle possibilities</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.teaserCard}>
                    <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>COMING SOON</Text>
                    </View>
                    <Ionicons name="rocket-outline" size={60} color="#425BA4" style={styles.teaserIcon} />
                    <Text style={styles.teaserTitle}>Something Big is Coming!</Text>
                    <Text style={styles.teaserDescription}>
                        We're building a unified ecosystem for all your lifestyle needs. From travel and stays to financial growth, everything you need will soon be right here in Tunzaa.
                    </Text>
                </View>

                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>What to Expect</Text>
                    {TEASER_SERVICES.map((service) => (
                        <View key={service.id} style={styles.featureItem}>
                            <View style={styles.iconCircle}>
                                <Ionicons name={service.icon as any} size={24} color="#425BA4" />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureName}>{service.name}</Text>
                                <Text style={styles.featureDesc}>{service.description}</Text>
                            </View>
                            <View style={styles.lockBadge}>
                                <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity 
                    style={styles.notifyButton}
                    onPress={() => Alert.alert("Stay Tuned!", "We'll notify you as soon as Tunzaa Services go live.")}
                >
                    <Text style={styles.notifyButtonText}>Notify Me</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#818CF8',
    },
    greeting: {
        color: '#E0E7FF',
        fontSize: 12,
        marginBottom: 2,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        marginTop: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#E0E7FF',
        opacity: 0.9,
    },
    scrollContent: {
        paddingTop: 32,
        paddingHorizontal: 20,
        paddingBottom: 110,
    },
    teaserCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    comingSoonBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 20,
    },
    comingSoonText: {
        color: '#1D4ED8',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    teaserIcon: {
        marginBottom: 20,
    },
    teaserTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    teaserDescription: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
    },
    featuresSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E2937',
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 12,
        color: '#94A3B8',
    },
    lockBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifyButton: {
        backgroundColor: '#425BA4',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#425BA4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    notifyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

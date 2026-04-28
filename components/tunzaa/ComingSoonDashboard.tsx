import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { LogOut, Settings, Bell, User } from 'lucide-react-native';

export default function ComingSoonDashboard({ role = 'buyer' }: { role?: 'buyer' | 'vendor' | 'delivery' }) {
    const router = useRouter();
    const { t } = useLanguage();
    const { user, logout } = useTunzaaAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>{t.homeWelcome}</Text>
                    <Text style={styles.nameText}>{user?.first_name || 'User'}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Bell size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(buyer)/profile/settings' as any)}>
                        <Settings size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <Image 
                        source={require('@/assets/blue-tunzaa-logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Version 2.0</Text>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{role === 'vendor' ? 'Merchant Portal' : 'Marketplace'}</Text>
                    <Text style={styles.subtitle}>{t.homeComingSoon}</Text>
                    <Text style={styles.description}>
                        We are currently building a premium {role} experience just for you. 
                        Stay tuned for updates!
                    </Text>
                </View>

                {/* Placeholder Cards */}
                <View style={styles.cardContainer}>
                    <View style={[styles.placeholderCard, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <View style={styles.skeletonIcon} />
                        <View style={styles.skeletonLineShort} />
                    </View>
                    <View style={[styles.placeholderCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                        <View style={styles.skeletonIcon} />
                        <View style={styles.skeletonLineShort} />
                    </View>
                </View>
            </View>

            {/* Footer Action */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>{t.settingsLogout}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#315BA9', // Tunzaa Blue
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        fontFamily: 'System',
    },
    nameText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Gilroy-Bold',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 150,
        height: 150,
        tintColor: '#FFFFFF',
    },
    badge: {
        backgroundColor: '#84CC16', // Tunzaa Green
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: -20,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#84CC16',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        gap: 20,
        width: '100%',
    },
    placeholderCard: {
        flex: 1,
        height: 120,
        borderRadius: 16,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skeletonIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 10,
    },
    skeletonLineShort: {
        width: '60%',
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

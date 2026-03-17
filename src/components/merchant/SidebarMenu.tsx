import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { 
    LayoutGrid, 
    Box, 
    TrendingUp,
    Users, 
    Wallet, 
    Settings, 
    LogOut, 
    X,
    ChevronRight,
    Search,
    Bell,
    CheckCircle,
    Briefcase,
    MoreHorizontal,
    User,
    ChevronDown
} from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTunzaaAuth } from '../../contexts/TunzaaAuthContext';

const { width, height } = Dimensions.get('window');

interface SidebarMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isVisible, onClose }: SidebarMenuProps) {
    const { user, logout } = useTunzaaAuth();
    const router = useRouter();
    const pathname = usePathname();
    const slideAnim = useRef(new Animated.Value(-width)).current; // Start completely off-screen

    // Find vendor profile and extract details
    const vendorProfile = user?.profiles?.find(p => p.role === 'vendor') as any;
    
    // Check metadata for branding if not directly on profile
    const metadata = vendorProfile?.metadata || {};
    const logoUrl = metadata.logo_url || metadata.image_url || vendorProfile?.branding?.logo_url;
    
    const displayName = metadata.business_name || vendorProfile?.display_name || vendorProfile?.business_name || user?.name || 'Merchant';
    
    // Calculate initials
    const initials = displayName
        .split(' ')
        .filter((n: string) => n.length > 0)
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Format joined date
    const joinedDate = vendorProfile?.created_at 
        ? new Date(vendorProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'March 2026';

    useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, slideAnim]);

    const handleLogout = async () => {
        onClose();
        await logout();
        router.replace('/');
    };

    const navigateTo = (route: string) => {
        onClose();
        // If it's the current route, don't push
        if (pathname === route) return;
        router.push(route as any);
    };

    // Helper to check if a route is active
    const isActive = (route: string) => pathname === route;

    // Don't render until visible or animating out to avoid blocking touches underneath
    if (!isVisible && (slideAnim as any)._value === -width) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlayContainer}>
                {/* Darkened Background */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Sliding Menu Panel */}
                <Animated.View
                    style={[
                        styles.menuPanel,
                        { transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    {/* Header: User Info */}
                    <View style={styles.header}>
                        <View style={styles.userInfoRow}>
                            <View style={styles.avatarContainer}>
                                {logoUrl ? (
                                    <Image 
                                        source={{ uri: logoUrl }} 
                                        style={styles.avatarImage} 
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.logoPlaceholder}>
                                        <Text style={styles.avatarInitials}>{initials}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                                <View style={styles.joinedRow}>
                                    <Briefcase size={12} color="#6B7280" style={{ marginRight: 4 }} />
                                    <Text style={styles.joinedText}>Joined {joinedDate}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <MoreHorizontal size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Items */}
                    <View style={styles.navContainer}>
                        {/* Dashboard */}
                        <TouchableOpacity 
                            style={[styles.navItem, isActive('/(merchant)') && styles.activeNavItem]}
                            onPress={() => navigateTo('/(merchant)')}
                        >
                            <Briefcase size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                            <Text style={[styles.navText, isActive('/(merchant)') && styles.activeNavText]}>Dashboard</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.navItem, isActive('/(merchant)/inventory') && styles.activeNavItem]}
                            onPress={() => navigateTo('/(merchant)/inventory')}
                        >
                            <Box size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                            <Text style={[styles.navText, isActive('/(merchant)/inventory') && styles.activeNavText]}>Inventory</Text>
                        </TouchableOpacity>

                        {/* Orders and sales */}
                        <TouchableOpacity 
                            style={[styles.navItem, isActive('/(merchant)/live-orders') && styles.activeNavItem]}
                            onPress={() => navigateTo('/(merchant)/live-orders')}
                        >
                            <TrendingUp size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                            <Text style={[styles.navText, isActive('/(merchant)/live-orders') && styles.activeNavText]}>Orders and sales</Text>
                        </TouchableOpacity>

                        {/* Customer Profile (linked to Store Profile) */}
                        <TouchableOpacity 
                            style={[styles.navItem, isActive('/(merchant)/store-profile') && styles.activeNavItem]}
                            onPress={() => navigateTo('/(merchant)/store-profile')}
                        >
                            <User size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                            <Text style={[styles.navText, isActive('/(merchant)/store-profile') && styles.activeNavText]}>Customer Profile</Text>
                        </TouchableOpacity>

                        {/* Loans (with dropdown) */}
                        <TouchableOpacity style={styles.navItemRow}>
                            <View style={styles.navItemLeft}>
                                <Wallet size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                                <Text style={styles.navText}>Loans</Text>
                            </View>
                            <ChevronDown size={18} color="#111827" />
                        </TouchableOpacity>

                        {/* Logout */}
                        <TouchableOpacity style={[styles.navItem, { marginTop: 40 }]} onPress={handleLogout}>
                            <LogOut size={22} color="#EF4444" style={styles.navIcon} />
                            <Text style={[styles.navText, { color: '#EF4444' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuPanel: {
        width: width * 0.8, // 80% of screen width
        maxWidth: 320,
        height: '100%',
        backgroundColor: '#FFFFFF',
        paddingTop: 60, // Status bar clear
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#3A5BA9', // Theme Blue
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    userDetails: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    joinedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    joinedText: {
        fontSize: 12,
        color: '#111827',
    },
    moreButton: {
        padding: 4,
    },
    navContainer: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    activeNavItem: {
        backgroundColor: '#EEF2FF', // Light blue/lavender for active
    },
    navItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    logoPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navIcon: {
        marginRight: 12,
    },
    navText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    activeNavText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    }
});

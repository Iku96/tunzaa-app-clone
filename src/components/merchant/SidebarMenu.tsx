import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { LayoutGrid, Box, ShoppingBag, User, Wallet, ChevronDown, MoreHorizontal, Briefcase } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SidebarMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isVisible, onClose }: SidebarMenuProps) {
    const slideAnim = useRef(new Animated.Value(-width)).current; // Start completely off-screen

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

    // Don't render until visible or animating out to avoid blocking touches underneath
    if (!isVisible && slideAnim._value === -width) return null;

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
                                <Text style={styles.avatarInitials}>V</Text>
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.userName}>Vodacom</Text>
                                <View style={styles.joinedRow}>
                                    <Briefcase size={12} color="#111827" style={{ marginRight: 4 }} />
                                    <Text style={styles.joinedText}>Joined November 2010</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <MoreHorizontal size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Items */}
                    <View style={styles.navContainer}>
                        {/* Dashboard (Active) */}
                        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
                            <LayoutGrid size={22} color="#111827" style={styles.navIcon} />
                            <Text style={styles.activeNavText}>Dashboard</Text>
                        </TouchableOpacity>

                        {/* Inventory */}
                        <TouchableOpacity style={styles.navItem}>
                            <Box size={22} color="#111827" style={styles.navIcon} />
                            <Text style={styles.navText}>Inventory</Text>
                        </TouchableOpacity>

                        {/* Orders and sales */}
                        <TouchableOpacity style={styles.navItem}>
                            <ShoppingBag size={22} color="#111827" style={styles.navIcon} />
                            <Text style={styles.navText}>Orders and sales</Text>
                        </TouchableOpacity>

                        {/* Customer Profile */}
                        <TouchableOpacity style={styles.navItem}>
                            <User size={22} color="#111827" style={styles.navIcon} />
                            <Text style={styles.navText}>Customer Profile</Text>
                        </TouchableOpacity>

                        {/* Loans (with dropdown) */}
                        <TouchableOpacity style={styles.navItemRow}>
                            <View style={styles.navItemLeft}>
                                <Wallet size={22} color="#111827" style={styles.navIcon} />
                                <Text style={styles.navText}>Loans</Text>
                            </View>
                            <ChevronDown size={18} color="#111827" />
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
        backgroundColor: '#E50000', // Vodacom Red
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
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
        backgroundColor: '#F3F4F6', // Light gray background for active
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

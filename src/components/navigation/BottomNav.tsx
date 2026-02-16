import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (route: string) => {
        if (route === '/(buyer)/home' && (pathname === '/(buyer)/home' || pathname === '/(buyer)')) return true;
        if (route === '/(buyer)/orders' && pathname.startsWith('/(buyer)/orders')) return true;
        if (route === '/(buyer)/cart' && pathname.startsWith('/(buyer)/cart')) return true;
        if (route === '/(buyer)/profile' && pathname.startsWith('/(buyer)/profile')) return true;
        return false;
    };

    const getIconColor = (route: string) => isActive(route) ? '#FBBF24' : '#FFFFFF';
    const getTextColor = (route: string) => isActive(route) ? '#FBBF24' : '#FFFFFF';

    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/home')}>
                <Ionicons name="home" size={24} color={getIconColor('/(buyer)/home')} />
                <Text style={[styles.navText, { color: getTextColor('/(buyer)/home') }]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/orders')}>
                <Ionicons name="basket-outline" size={24} color={getIconColor('/(buyer)/orders')} />
                <Text style={[styles.navText, { color: getTextColor('/(buyer)/orders') }]}>Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/cart')}>
                <Ionicons name="cart-outline" size={24} color={getIconColor('/(buyer)/cart')} />
                <Text style={[styles.navText, { color: getTextColor('/(buyer)/cart') }]}>Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/services')}>
                <Ionicons name="grid-outline" size={24} color={getIconColor('/(buyer)/services')} />
                <Text style={[styles.navText, { color: getTextColor('/(buyer)/services') }]}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/profile')}>
                <Ionicons name="person-outline" size={24} color={getIconColor('/(buyer)/profile')} />
                <Text style={[styles.navText, { color: getTextColor('/(buyer)/profile') }]}>Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: '#4A55A2',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: 16,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 20,
    },
    navItem: {
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
    },
    navText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    }
});

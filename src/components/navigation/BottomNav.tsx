import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

import { useTunzaaAuth } from '../../contexts/TunzaaAuthContext';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useTunzaaAuth();

    const isActive = (route: string) => {
        if (route === '/(buyer)' && (pathname === '/(buyer)' || pathname === '/' || pathname === '/(buyer)/index')) return true;
        if (route === '/(buyer)/orders' && pathname.startsWith('/(buyer)/orders')) return true;
        if (route === '/(buyer)/cart' && pathname.startsWith('/(buyer)/cart')) return true;
        if (route === '/(buyer)/services' && pathname.startsWith('/(buyer)/services')) return true;
        if (route === '/(buyer)/account' && (pathname.startsWith('/(buyer)/account') || pathname.startsWith('/(buyer)/profile'))) return true;
        return false;
    };

    const getIconColor = (route: string) => isActive(route) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';
    const getTextColor = (route: string) => isActive(route) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';

    const getIconName = (route: string, activeName: string, inactiveName: string) =>
        isActive(route) ? activeName : inactiveName;

    const handleNav = (route: string, isProtected: boolean = false) => {
        if (isProtected && !isAuthenticated) {
            import('react-native').then(rn => {
                rn.Alert.alert(
                    'Account Required',
                    'Please login or create an account to access this section.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Login', onPress: () => router.push('/login') },
                        { text: 'Create Account', onPress: () => router.push('/register') }
                    ]
                );
            });
            return;
        }
        router.push(route as any);
    };

    return (
        <View style={styles.bottomNavWrapper}>
            <View style={styles.svgContainer}>
                <Svg height="24" width={width} viewBox={`0 0 ${width} 24`}>
                    <Path
                        d="M 0 24 L 0 0 A 24 24 0 0 0 24 24 Z"
                        fill="#425BA4"
                    />
                    <Path
                        d={`M ${width - 24} 24 A 24 24 0 0 0 ${width} 0 L ${width} 24 Z`}
                        fill="#425BA4"
                    />
                </Svg>
            </View>
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNav('/(buyer)')}>
                    <Ionicons name={getIconName('/(buyer)', 'home', 'home-outline') as any} size={24} color={getIconColor('/(buyer)')} />
                    <Text style={[styles.navText, { color: getTextColor('/(buyer)') }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNav('/(buyer)/orders', true)}>
                    <Ionicons name={getIconName('/(buyer)/orders', 'bag-handle', 'bag-handle-outline') as any} size={24} color={getIconColor('/(buyer)/orders')} />
                    <Text style={[styles.navText, { color: getTextColor('/(buyer)/orders') }]}>Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNav('/(buyer)/cart', true)}>
                    <Ionicons name={getIconName('/(buyer)/cart', 'cart', 'cart-outline') as any} size={24} color={getIconColor('/(buyer)/cart')} />
                    <Text style={[styles.navText, { color: getTextColor('/(buyer)/cart') }]}>Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNav('/(buyer)/services')}>
                    <Ionicons name={getIconName('/(buyer)/services', 'grid', 'grid-outline') as any} size={24} color={getIconColor('/(buyer)/services')} />
                    <Text style={[styles.navText, { color: getTextColor('/(buyer)/services') }]}>Services</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNav('/(buyer)/account', true)}>
                    <Ionicons name={getIconName('/(buyer)/account', 'person-circle', 'person-circle-outline') as any} size={26} color={getIconColor('/(buyer)/account')} />
                    <Text style={[styles.navText, { color: getTextColor('/(buyer)/account') }]}>Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNavWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    svgContainer: {
        height: 24,
        width: '100%',
        marginBottom: -2, // Pull down slightly to avoid 1px gaps
        // add shadow only to the top edge for iOS if needed, but usually flat is better
    },
    bottomNav: {
        height: 90,
        backgroundColor: '#425BA4',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: 16,
        paddingBottom: 24,
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

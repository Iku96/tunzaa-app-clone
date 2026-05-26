import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

import { useTunzaaAuth } from '../../contexts/TunzaaAuthContext';

const CustomCartIcon = ({ color, size = 24 }: { color: string, size?: number }) => {
    return (
        <Svg width={size} height={size} viewBox="15 0 24 24" fill="none">
            <Path d="M22.9004 16H30.1636C34.6512 16 35.3337 13.1808 36.1614 9.06908C36.4002 7.88311 36.5196 7.29013 36.2325 6.89507C35.9454 6.5 35.3951 6.5 34.2945 6.5H33.9004M20.9004 6.5H22.9004" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
            <Path d="M25.9004 8.5C26.3919 9.0057 27.7002 11 28.4004 11M28.4004 11C29.1006 11 30.4089 9.0057 30.9004 8.5M28.4004 11V3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M22.9004 16L20.2791 3.51493C20.0565 2.62459 19.2566 2 18.3388 2H17.4004" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
            <Path d="M23.7804 16H23.369C22.0056 16 20.9004 17.1513 20.9004 18.5714C20.9004 18.8081 21.0846 19 21.3118 19H32.4004" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M25.4004 22C26.2288 22 26.9004 21.3284 26.9004 20.5C26.9004 19.6716 26.2288 19 25.4004 19C24.572 19 23.9004 19.6716 23.9004 20.5C23.9004 21.3284 24.572 22 25.4004 22Z" stroke={color} strokeWidth="1.5"/>
            <Path d="M32.4004 22C33.2288 22 33.9004 21.3284 33.9004 20.5C33.9004 19.6716 33.2288 19 32.4004 19C31.572 19 30.9004 19.6716 30.9004 20.5C30.9004 21.3284 31.572 22 32.4004 22Z" stroke={color} strokeWidth="1.5"/>
        </Svg>
    );
};


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
                    {isActive('/(buyer)/cart') ? (
                        <CustomCartIcon color="#FFFFFF" size={26} />
                    ) : (
                        <CustomCartIcon color="rgba(255, 255, 255, 0.7)" size={24} />
                    )}
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

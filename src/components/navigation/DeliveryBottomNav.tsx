import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DeliveryBottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    // Map segments to current active tab
    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {/* Delivery / Requests Tab */}
            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/(delivery)/home')}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isActive('/(delivery)/home') ? "cube" : "cube-outline"}
                    size={24}
                    color={isActive('/(delivery)/home') ? "#425BA4" : "#6B7280"}
                />
                <Text style={[
                    styles.label,
                    { color: isActive('/(delivery)/home') ? "#425BA4" : "#6B7280" }
                ]}>
                    Delivery
                </Text>
            </TouchableOpacity>

            {/* Profile Tab */}
            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/(delivery)/profile')} // Assuming we'll have a profile screen
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isActive('/(delivery)/profile') ? "person" : "person-outline"}
                    size={24}
                    color={isActive('/(delivery)/profile') ? "#425BA4" : "#6B7280"}
                />
                <Text style={[
                    styles.label,
                    { color: isActive('/(delivery)/profile') ? "#425BA4" : "#6B7280" }
                ]}>
                    Profile
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        paddingHorizontal: 20,
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    }
});

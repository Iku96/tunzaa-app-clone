import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '@/src/services/notifications';

const STORAGE_KEY = '@loan_notification_settings';

export default function NotificationsSettingsScreen() {
    const router = useRouter();

    // State for toggles
    const [deliveryAlerts, setDeliveryAlerts] = useState(false);
    const [promotions, setPromotions] = useState(false);
    const [systemMessages, setSystemMessages] = useState(false);

    // Load settings on mount
    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setDeliveryAlerts(parsed.deliveryAlerts ?? false);
                    setPromotions(parsed.promotions ?? false);
                    setSystemMessages(parsed.systemMessages ?? false);
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            }
        };
        loadSettings();
    }, []);

    // Save settings when they change
    const saveSettings = async (updates: any) => {
        try {
            const current = { 
                deliveryAlerts, 
                promotions, 
                systemMessages,
                ...updates 
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch (err) {
            console.error("Failed to save settings:", err);
        }
    };

    const toggleDelivery = async (value: boolean) => {
        setDeliveryAlerts(value);
        saveSettings({ deliveryAlerts: value });
        if (value) {
            try {
                await NotificationService.registerForPushNotificationsAsync();
                await NotificationService.sendDeliveryAlert('B-1029', 'Shipped');
            } catch (e) {
                console.warn(e);
            }
        }
    };

    const togglePromotions = async (value: boolean) => {
        setPromotions(value);
        saveSettings({ promotions: value });
        if (value) {
            try {
                await NotificationService.registerForPushNotificationsAsync();
                await NotificationService.sendPromotionAlert('20% Off Your Next Purchase');
            } catch (e) {
                console.warn(e);
            }
        }
    };

    const toggleSystem = async (value: boolean) => {
        setSystemMessages(value);
        saveSettings({ systemMessages: value });
        if (value) {
            try {
                await NotificationService.registerForPushNotificationsAsync();
                await NotificationService.sendSystemMessage('Welcome to Tunzaa Rewards!');
            } catch (e) {
                console.warn(e);
            }
        }
    };

    const renderToggleItem = (icon: string, label: string, value: boolean, onValueChange: (val: boolean) => void) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemLeft}>
                <Ionicons name={icon as any} size={22} color="#1F2937" style={styles.icon} />
                <Text style={styles.itemTitle}>{label}</Text>
            </View>
            <Switch
                trackColor={{ false: '#E5E7EB', true: '#425BA4' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={onValueChange}
                value={value}
                style={styles.switch}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>In-App Notification</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {renderToggleItem('car-outline', 'Delivery Tracking alerts', deliveryAlerts, toggleDelivery)}
                {renderToggleItem('checkmark-circle-outline', 'Promotions and offer', promotions, togglePromotions)}
                {renderToggleItem('flash-outline', 'System messages', systemMessages, toggleSystem)}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    content: {
        paddingTop: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 16,
    },
    itemTitle: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '400',
    },
    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
});

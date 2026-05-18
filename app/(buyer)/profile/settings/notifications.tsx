import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../../../../src/services/notifications';
import { authApi } from '../../../../src/services/auth';
import { Platform, Alert } from 'react-native';

const STORAGE_KEY = '@buyer_notification_settings';

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

    const handleEnablePush = async () => {
        try {
            const token = await NotificationService.registerForPushNotificationsAsync();
            if (token) {
                // Save the token to the backend so the server can push to this device
                await authApi.addFirebaseToken({
                    token,
                    device_type: Platform.OS === 'ios' ? 'ios' : 'android'
                }).catch(e => console.log('Backend token sync issue (safe to ignore if testing):', e));
                console.log("Push token registered successfully:", token);
                return true;
            } else {
                Alert.alert(
                    'Permission Required', 
                    'Please enable notifications in your device settings to receive alerts.'
                );
                return false;
            }
        } catch (error) {
            console.error("Failed to register push token:", error);
            return false;
        }
    };

    const toggleDelivery = async (value: boolean) => {
        if (value) {
            const success = await handleEnablePush();
            if (!success) return; // Revert switch if permission denied
            await NotificationService.sendDeliveryAlert('B-1029', 'Shipped');
        }
        setDeliveryAlerts(value);
        saveSettings({ deliveryAlerts: value });
    };

    const togglePromotions = async (value: boolean) => {
        if (value) {
            const success = await handleEnablePush();
            if (!success) return;
            await NotificationService.sendPromotionAlert('20% Off Your Next Purchase');
        }
        setPromotions(value);
        saveSettings({ promotions: value });
    };

    const toggleSystem = async (value: boolean) => {
        if (value) {
            const success = await handleEnablePush();
            if (!success) return;
            await NotificationService.sendSystemMessage('Welcome to Tunzaa Rewards!');
        }
        setSystemMessages(value);
        saveSettings({ systemMessages: value });
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
        <SafeAreaView style={styles.safeArea}>
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

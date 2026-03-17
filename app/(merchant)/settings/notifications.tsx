import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Truck, BadgePercent, Smartphone } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@merchant_notification_settings';

export default function NotificationsSettingsScreen() {
    const router = useRouter();
    
    const [deliveryAlerts, setDeliveryAlerts] = useState(false);
    const [promotions, setPromotions] = useState(false);
    const [systemMessages, setSystemMessages] = useState(false);

    // Load settings on mount
    useEffect(() => {
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

    const toggleDelivery = (value: boolean) => {
        setDeliveryAlerts(value);
        saveSettings({ deliveryAlerts: value });
    };

    const togglePromotions = (value: boolean) => {
        setPromotions(value);
        saveSettings({ promotions: value });
    };

    const toggleSystem = (value: boolean) => {
        setSystemMessages(value);
        saveSettings({ systemMessages: value });
    };

    const NotificationItem = ({ icon: Icon, label, value, onToggle }: any) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                    <Icon size={22} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <Switch
                trackColor={{ false: '#E5E7EB', true: '#3A5BA9' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>In-App Notification</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <NotificationItem
                    icon={Truck}
                    label="Delivery Tracking alerts"
                    value={deliveryAlerts}
                    onToggle={toggleDelivery}
                />
                <NotificationItem
                    icon={BadgePercent}
                    label="Promotions and offer"
                    value={promotions}
                    onToggle={togglePromotions}
                />
                <NotificationItem
                    icon={Smartphone}
                    label="System messages"
                    value={systemMessages}
                    onToggle={toggleSystem}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        flex: 1,
    },
    content: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '400',
    },
});

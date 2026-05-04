import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Truck, 
    BadgePercent, 
    Bot 
} from 'lucide-react-native';
import { usePreferencesStore } from '@/stores/preferences';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { 
        deliveryTracking, setDeliveryTracking,
        promotionsOffers, setPromotionsOffers,
        systemMessages, setSystemMessages
    } = usePreferencesStore();

    const settings = [
        {
            id: 'delivery',
            title: 'Delivery Tracking alerts',
            icon: <Truck size={24} color="#1F2937" strokeWidth={1.5} />,
            value: deliveryTracking,
            onValueChange: setDeliveryTracking
        },
        {
            id: 'promotions',
            title: 'Promotions and offer',
            icon: <BadgePercent size={24} color="#1F2937" strokeWidth={1.5} />,
            value: promotionsOffers,
            onValueChange: setPromotionsOffers
        },
        {
            id: 'system',
            title: 'System messages',
            icon: <Bot size={24} color="#1F2937" strokeWidth={1.5} />,
            value: systemMessages,
            onValueChange: setSystemMessages
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>In-App Notification</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.settingsList}>
                    {settings.map((item) => (
                        <View key={item.id} style={styles.settingItem}>
                            <View style={styles.iconWrapper}>
                                {item.icon}
                            </View>
                            <Text style={styles.settingTitle}>{item.title}</Text>
                            <Switch
                                value={item.value}
                                onValueChange={item.onValueChange}
                                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#E5E7EB"
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
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
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
    },
    settingsList: {
        paddingHorizontal: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    iconWrapper: {
        marginRight: 16,
        width: 32,
        alignItems: 'center',
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '400',
    },
});

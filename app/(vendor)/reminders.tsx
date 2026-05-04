import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    MessageSquare, 
    Calendar, 
    PieChart 
} from 'lucide-react-native';
import { usePreferencesStore } from '@/stores/preferences';

export default function RemindersScreen() {
    const router = useRouter();
    const { 
        upcomingPayments, setUpcomingPayments,
        paymentDueDate, setPaymentDueDate,
        goalProgress, setGoalProgress
    } = usePreferencesStore();

    const reminderSettings = [
        {
            id: 'upcoming',
            title: 'Upcoming payments',
            icon: <MessageSquare size={24} color="#1F2937" strokeWidth={1.5} />,
            value: upcomingPayments,
            onValueChange: setUpcomingPayments
        },
        {
            id: 'due_date',
            title: 'Payment due date',
            icon: <Calendar size={24} color="#1F2937" strokeWidth={1.5} />,
            value: paymentDueDate,
            onValueChange: setPaymentDueDate
        },
        {
            id: 'goal',
            title: 'Goal progress',
            icon: <PieChart size={24} color="#1F2937" strokeWidth={1.5} />,
            value: goalProgress,
            onValueChange: setGoalProgress
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reminder</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.settingsList}>
                    {reminderSettings.map((item) => (
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

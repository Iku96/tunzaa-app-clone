import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReminderScreen() {
    const router = useRouter();

    // State for toggles
    const [upcoming, setUpcoming] = useState(false);
    const [paymentDue, setPaymentDue] = useState(false);
    const [goalProgress, setGoalProgress] = useState(false);

    const renderToggleItem = (icon: string, label: string, value: boolean, onValueChange: (val: boolean) => void) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemLeft}>
                <Ionicons name={icon as any} size={22} color="#1F2937" style={styles.icon} />
                <Text style={styles.itemTitle}>{label}</Text>
            </View>
            <Switch
                trackColor={{ false: '#E5E7EB', true: '#4A55A2' }}
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
                <Text style={styles.headerTitle}>Reminder</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {renderToggleItem('time-outline', 'Upcoming payments', upcoming, setUpcoming)}
                {renderToggleItem('calendar-outline', 'Payment due date', paymentDue, setPaymentDue)}
                {renderToggleItem('pie-chart-outline', 'Goal progress', goalProgress, setGoalProgress)}
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

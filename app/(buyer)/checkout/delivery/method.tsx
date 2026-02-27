import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliveryMethodScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Method</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Options */}
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => router.push('/(buyer)/checkout/delivery/courier')}
                >
                    <View style={styles.optionLeft}>
                        <Ionicons name="location-outline" size={22} color="#4B5563" style={styles.icon} />
                        <Text style={styles.optionText}>Add delivery address</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.optionRow}
                // For now, this could just skip to address selection or summary if they had saved addresses
                // onPress={() => router.push('/(buyer)/checkout/delivery/address')}
                >
                    <View style={styles.optionLeft}>
                        <Ionicons name="business-outline" size={22} color="#4B5563" style={styles.icon} />
                        <Text style={styles.optionText}>My address saved</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 20,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    optionText: {
        fontSize: 15,
        color: '#1F2937',
    },
});

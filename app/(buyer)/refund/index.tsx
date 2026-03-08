import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundMenuScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refund</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(buyer)/refund/request')}
                >
                    <Text style={styles.menuItemText}>Refund</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(buyer)/transfer/')}
                >
                    <Text style={styles.menuItemText}>Transfer Fund</Text>
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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    content: {
        marginTop: 24,
    },
    menuItem: {
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    menuItemText: {
        fontSize: 15,
        color: '#1F2937',
    },
});

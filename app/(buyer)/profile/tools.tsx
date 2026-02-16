import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ToolsScreen() {
    const router = useRouter();

    const renderToolItem = (label: string, onPress?: () => void) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <Text style={styles.itemLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tools</Text>
                <View style={{ width: 32 }} /> {/* Spacer for centering */}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderToolItem("Switch account type")}
                {renderToolItem("Add new business branch")}

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Tunzaa Version 2.0</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        paddingVertical: 10,
    },
    itemContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        // borderBottomWidth: 1,
        // borderBottomColor: '#F3F4F6',
    },
    itemLabel: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 40,
        alignItems: 'center',
        marginTop: 'auto',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

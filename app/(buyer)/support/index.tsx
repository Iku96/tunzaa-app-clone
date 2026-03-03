import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpCenterScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'FAQ' | 'Contact Us'>('FAQ');

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'FAQ' && styles.activeTab]}
                    onPress={() => setActiveTab('FAQ')}
                >
                    <Text style={[styles.tabText, activeTab === 'FAQ' && styles.activeTabText]}>FAQ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Contact Us' && styles.activeTab]}
                    onPress={() => setActiveTab('Contact Us')}
                >
                    <Text style={[styles.tabText, activeTab === 'Contact Us' && styles.activeTabText]}>Contact Us</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'FAQ' ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="help-circle-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>Frequently Asked Questions will appear here.</Text>
                    </View>
                ) : (
                    <View style={styles.contactContainer}>
                        <TouchableOpacity style={styles.contactCard} onPress={() => router.push('/(buyer)/support/live-chat')}>
                            <View style={styles.contactLeft}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="chatbubbles-outline" size={24} color="#4A55A2" />
                                </View>
                                <View>
                                    <Text style={styles.contactTitle}>Live Chat</Text>
                                    <Text style={styles.contactDesc}>Get response within 2 mins.</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginTop: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4A55A2',
    },
    tabText: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1A1A1A',
        fontWeight: '600',
    },
    content: {
        padding: 24,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    contactContainer: {
        paddingTop: 8,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    contactDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
});

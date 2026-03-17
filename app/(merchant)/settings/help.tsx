import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Mail, MessageSquare } from 'lucide-react-native';

type Tab = 'faq' | 'contact';

export default function HelpCenterScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('faq');

    const contactNumbers = ['(+255) 753 090 090'];
    const contactEmail = 'mambo@Tunzaa.com';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'faq' && styles.activeTab]} 
                    onPress={() => setActiveTab('faq')}
                >
                    <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>FAQ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'contact' && styles.activeTab]} 
                    onPress={() => setActiveTab('contact')}
                >
                    <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>Contact Us</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'faq' ? (
                    <View style={styles.faqContainer}>
                        {/* FAQ content can be added here later */}
                        <Text style={styles.emptyText}>No FAQs found yet.</Text>
                    </View>
                ) : (
                    <View style={styles.contactContainer}>
                        <Text style={styles.contactIntro}>
                            Contact us for any enquiries . We'll be happy to help you .
                        </Text>

                        {contactNumbers.map((num, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={styles.contactCard}
                                onPress={() => Linking.openURL(`tel:${num.replace(/[^\d+]/g, '')}`)}
                            >
                                <Phone size={20} color="#111827" style={styles.contactIcon} />
                                <Text style={styles.contactValue}>{num}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity 
                            style={styles.contactCard}
                            onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
                        >
                            <Mail size={20} color="#111827" style={styles.contactIcon} />
                            <Text style={styles.contactValue}>{contactEmail}</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>Or</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity 
                            style={styles.liveChatButton}
                            onPress={() => router.push('/(merchant)/settings/live-chat')}
                        >
                            <MessageSquare size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                            <Text style={styles.liveChatText}>Live chart</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3A5BA9',
    },
    tabText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
    },
    faqContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    contactContainer: {
        paddingTop: 10,
    },
    contactIntro: {
        fontSize: 18,
        color: '#9CA3AF', // Grayer as in screenshot
        lineHeight: 28,
        marginBottom: 40,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 40,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    contactIcon: {
        marginRight: 15,
    },
    contactValue: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 40,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
        fontSize: 16,
    },
    liveChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3A5BA9',
        borderRadius: 30,
        height: 56,
    },
    liveChatText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

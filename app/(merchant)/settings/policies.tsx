import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function PoliciesScreen() {
    const router = useRouter();

    const PolicyItem = ({ icon: Icon, label, onPress }: any) => (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                    <Icon size={22} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Policies</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <PolicyItem 
                    icon={FileText} 
                    label="Terms and condition" 
                    onPress={() => openLink('https://tunzaa.co.tz/en/terms-of-service')} 
                />
                <PolicyItem 
                    icon={ShieldCheck} 
                    label="Privacy Centre" 
                    onPress={() => openLink('https://tunzaa.co.tz/en/privacy-policy')} 
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

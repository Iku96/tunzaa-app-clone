import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Trash2, HelpCircle, ChevronRight } from 'lucide-react-native';

export default function AccountManagerScreen() {
    const router = useRouter();

    const AccountItem = ({ icon: Icon, label, onPress, isDestructive = false }: any) => (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconWrapper]}>
                    <Icon size={22} color={isDestructive ? "#EF4444" : "#111827"} strokeWidth={1.5} />
                </View>
                <Text style={[styles.itemLabel, isDestructive && styles.destructiveText]}>{label}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action cannot be undone. All your data will be permanently removed. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => console.log("Delete account requested") }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Manager</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <AccountItem 
                    icon={Lock} 
                    label="Password" 
                    onPress={() => router.push('/(merchant)/settings/change-password')} 
                />
                <AccountItem 
                    icon={Trash2} 
                    label="Delete Account" 
                    onPress={handleDeleteAccount}
                />
                <AccountItem 
                    icon={HelpCircle} 
                    label="Help & FAQ" 
                    onPress={() => router.push('/(merchant)/settings/help')} 
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
    destructiveText: {
        color: '#EF4444',
    }
});

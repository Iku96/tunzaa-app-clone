import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ToolsScreen() {
    const router = useRouter();

    const handleSwitchAccountType = () => {
        Alert.alert(
            'Switch Account Type',
            'Would you like to switch your active role?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Switch', 
                    onPress: () => {
                        router.push('/role');
                    }
                }
            ]
        );
    };

    const handleAddBranch = () => {
        Alert.prompt(
            'Add New Branch',
            'Enter the name of the new business branch:',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Add', 
                    onPress: (branchName) => {
                        if (branchName && branchName.trim()) {
                            Alert.alert('Success', `Request to create branch "${branchName}" submitted successfully.`);
                        }
                    }
                }
            ],
            'plain-text'
        );
    };

    const renderToolRow = (title: string, onPress: () => void) => (
        <TouchableOpacity 
            style={styles.row} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.rowTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tools</Text>
                <View style={styles.placeholderBtn} />
            </View>

            {/* Content */}
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {renderToolRow('Switch account type', handleSwitchAccountType)}
                {renderToolRow('Add new business branch', handleAddBranch)}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Tunzaa Version 2.0</Text>
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    placeholderBtn: {
        width: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    rowTitle: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '400',
    },
    footer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareSheetProps {
    visible: boolean;
    onClose: () => void;
    shopName: string;
}

const SOCIAL_APPS = [
    { id: '1', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: '2', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
    { id: '3', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: '4', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
    { id: '5', name: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2' },
    { id: '6', name: 'Copy Link', icon: 'link', color: '#6B7280' },
];

export default function ShareSheet({ visible, onClose, shopName }: ShareSheetProps) {
    if (!visible) return null;

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.appItem} onPress={onClose}>
            <View style={[styles.appIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={styles.appName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <Text style={styles.title}>Share profile</Text>

                    {/* Copy Link Input Lookalike */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText} numberOfLines={1}>
                            https://tunzaa.co.tz/shops/{shopName.toLowerCase().replace(/\s/g, '-')}
                        </Text>
                        <TouchableOpacity style={styles.copyButton}>
                            <Ionicons name="copy-outline" size={18} color="#4A55A2" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={SOCIAL_APPS}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        numColumns={4}
                        contentContainerStyle={styles.gridContent}
                        columnWrapperStyle={styles.columnWrapper}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
    },
    linkText: {
        flex: 1,
        color: '#4B5563',
        fontSize: 14,
        marginRight: 8,
    },
    copyButton: {
        padding: 4,
    },
    gridContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    appItem: {
        alignItems: 'center',
        width: '22%',
    },
    appIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    appName: {
        fontSize: 12,
        color: '#4B5563',
        textAlign: 'center',
    },
});

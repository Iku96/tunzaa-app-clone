import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContactSheetProps {
    visible: boolean;
    onClose: () => void;
    shopName: string;
    shopPhone: string;
}

const { height } = Dimensions.get('window');

export default function ContactSheet({ visible, onClose, shopName, shopPhone }: ContactSheetProps) {
    if (!visible) return null;

    const handleCall = () => {
        Linking.openURL(`tel:${shopPhone}`);
        onClose();
    };

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

                    <Text style={styles.sheetTitle}>Contact</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>Chat on Tunzaa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleCall}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="call-outline" size={24} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>Call Seller</Text>
                    </TouchableOpacity>

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
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
});

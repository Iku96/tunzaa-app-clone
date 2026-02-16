import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BusinessMenuSheetProps {
    visible: boolean;
    onClose: () => void;
    onViewCertificate: (type: 'LICENSE' | 'TIN' | 'BRELA') => void;
}

const { height } = Dimensions.get('window');

export default function BusinessMenuSheet({ visible, onClose, onViewCertificate }: BusinessMenuSheetProps) {
    if (!visible) return null;

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

                    <Text style={styles.sectionTitle}>Documents</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onViewCertificate('TIN'); }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="document-text-outline" size={24} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>Taxpayer Identification Number (TIN)</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onViewCertificate('BRELA'); }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="business-outline" size={24} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>Registration Certificate</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onViewCertificate('LICENSE'); }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="ribbon-outline" size={24} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>Business License</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Contact</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>Chat on Tunzaa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
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
        maxHeight: height * 0.7,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
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
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
    },
});

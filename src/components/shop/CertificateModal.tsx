import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');

interface CertificateModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'LICENSE' | 'TIN' | 'BRELA' | null;
    imageUri?: string; // Optional override
}

export default function CertificateModal({ visible, onClose, type, imageUri }: CertificateModalProps) {
    if (!visible) return null;

    const getTitle = () => {
        switch (type) {
            case 'LICENSE': return 'Business License Certificate';
            case 'TIN': return 'Taxpayer Identification Number (TIN)';
            case 'BRELA': return 'BRELA Registration Certificate';
            default: return 'Certificate';
        }
    };

    // Placeholder images if not provided
    const getImage = () => {
        if (imageUri) return { uri: imageUri };
        // Return placeholders based on type for demo
        return { uri: 'https://via.placeholder.com/600x800' };
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} />

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Certificate Card */}
                <View style={styles.card}>
                    <View style={styles.imageContainer}>
                        <Image source={getImage()} style={styles.certificateImage} resizeMode="contain" />

                        {/* Watermark Overlay */}
                        <View style={styles.watermarkContainer}>
                            <Text style={styles.watermarkText}>TUNZAA</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.certificateTitle}>{getTitle()}</Text>
                        <Text style={styles.verifiedText}>Verified by Tunzaa</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        zIndex: 10,
    },
    card: {
        width: width * 0.85,
        height: height * 0.7,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: 20,
    },
    certificateImage: {
        width: '100%',
        height: '100%',
    },
    watermarkContainer: {
        position: 'absolute',
        bottom: 40,
        opacity: 0.1,
        transform: [{ rotate: '-15deg' }]
    },
    watermarkText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1F2937',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    certificateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: '#3B82F6', // Blue
        fontWeight: '500',
    },
});

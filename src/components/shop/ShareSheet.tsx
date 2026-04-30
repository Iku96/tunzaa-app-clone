import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, FlatList, Linking, Clipboard, Alert, Share } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

import { useSharesStore } from '../../stores/shares';

interface ShareSheetProps {
    visible: boolean;
    onClose: () => void;
    id: string;
    type: 'product' | 'shop' | 'profile';
    title: string;
    image: string;
}

const SOCIAL_APPS = [
    { id: '1', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2', type: 'ion' },
    { id: '2', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F', type: 'ion' },
    { id: '3', name: 'X', icon: 'x-twitter', color: '#000000', type: 'fa6' },
    { id: '4', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', type: 'ion' },
    { id: '5', name: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2', type: 'ion' },
    { id: '6', name: 'Copy Link', icon: 'link', color: '#6B7280', type: 'ion' },
    { id: '7', name: 'More', icon: 'share-social', color: '#425BA4', type: 'ion' },
];

export default function ShareSheet({ visible, onClose, id, type, title, image }: ShareSheetProps) {
    const { addItem } = useSharesStore();

    if (!visible) return null;

    const getShareUrl = () => {
        if (type === 'profile') {
            return `https://tunzaa.co.tz/users/profile/${id}`;
        } else {
            return `https://tunzaa.co.tz/${type}s/${id}`;
        }
    };

    const handleShare = async (app?: any) => {
        const url = getShareUrl();
        const shareMessage = `${title}\nCheck this out on Tunzaa: ${url}`;
        
        if (app?.name === 'Copy Link') {
            Clipboard.setString(url);
            Alert.alert('Link Copied', `The ${type} link has been copied to your clipboard.`);
            onClose();
        } else if (app?.name === 'More' || !app) {
            try {
                const result = await Share.share({
                    message: shareMessage,
                    url: url,
                    title: title
                });
                if (result.action === Share.sharedAction) {
                    onClose();
                }
            } catch (error: any) {
                Alert.alert('Error', error.message);
            }
        } else {
            // Specific app deep links
            let shareUrl = '';
            switch (app.name) {
                case 'WhatsApp':
                    shareUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
                    break;
                case 'Facebook':
                    shareUrl = `fb://facewebmodal/f?href=${encodeURIComponent(url)}`;
                    break;
                case 'X':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                    break;
                default:
                    shareUrl = url;
            }

            if (shareUrl) {
                const canOpen = await Linking.canOpenURL(shareUrl);
                if (canOpen) {
                    await Linking.openURL(shareUrl);
                } else {
                    // Fallback to native share or web
                    if (app.name === 'WhatsApp') {
                        await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`);
                    } else {
                        // If specific app fails, use generic native share
                        await Share.share({ message: shareMessage, url });
                    }
                }
            }
        }

        addItem({
            id,
            type,
            title,
            image,
            shared_at: new Date().toISOString()
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.appItem} onPress={() => handleShare(item)}>
            <View style={[styles.appIconContainer, { backgroundColor: item.color + '15' }]}>
                {item.type === 'fa6' ? (
                    <FontAwesome6 name={item.icon as any} size={24} color={item.color} />
                ) : (
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                )}
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
                            {type === 'profile' ? `https://tunzaa.co.tz/users/profile/${id}` : `https://tunzaa.co.tz/${type}s/${id}`}
                        </Text>
                        <TouchableOpacity style={styles.copyButton} onPress={() => handleShare()}>
                            <Ionicons name="copy-outline" size={18} color="#425BA4" />
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

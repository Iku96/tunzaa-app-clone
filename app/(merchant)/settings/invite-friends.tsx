import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Share2 } from 'lucide-react-native';

// Try to import Clipboard, but don't let it crash the app if the native module is missing
let Clipboard: any = null;
try {
    Clipboard = require('expo-clipboard');
} catch (e) {
    console.warn('ExpoClipboard native module not found');
}

export default function InviteFriendsScreen() {
    const router = useRouter();
    const referralCode = 'TUNZAA-PRO-001';
    const inviteLink = `https://tunzaa.co.tz/invite?code=${referralCode}`;

    const handleCopy = async () => {
        if (Clipboard && Clipboard.setStringAsync) {
            await Clipboard.setStringAsync(referralCode);
            Alert.alert('Copied!', 'Referral code copied to clipboard.');
        } else {
            Alert.alert('Referral Code', `Your code is: ${referralCode}\n\n(Clipboard access is currently unavailable on this device)`);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Grow your business with Tunzaa! Join using my referral code: ${referralCode} or via this link: ${inviteLink}`,
                url: inviteLink,
                title: 'Invite to Tunzaa',
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invite Friends</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <View style={styles.iconCircle}>
                        <Share2 size={64} color="#425BA4" />
                    </View>
                </View>

                <Text style={styles.title}>Invite your friends to Tunzaa</Text>
                <Text style={styles.description}>
                    Help other businesses grow by inviting them to join the Tunzaa marketplace. 
                    Share your unique referral code below.
                </Text>

                <View style={styles.codeContainer}>
                    <View style={styles.codeBox}>
                        <Text style={styles.codeText}>{referralCode}</Text>
                        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
                            <Copy size={20} color="#425BA4" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Text style={styles.shareBtnText}>Share Invitation Link</Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Why invite others?</Text>
                    <Text style={styles.infoText}>
                        A larger marketplace means more customers for everyone. 
                        Help us build the biggest commerce community in Tanzania.
                    </Text>
                </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingTop: 40,
    },
    illustrationContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    codeContainer: {
        width: '100%',
        marginBottom: 24,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    codeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        letterSpacing: 1,
    },
    copyBtn: {
        padding: 4,
    },
    shareBtn: {
        width: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#425BA4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    shareBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        marginTop: 60,
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 16,
        width: '100%',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    }
});

import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface GoogleAccountChooserProps {
    visible: boolean;
    onClose: () => void;
    onAccountSelect: (email: string) => void;
}

/**
 * Google Account Chooser Modal
 * UI mock for Google account selection
 */
export default function GoogleAccountChooser({ visible, onClose, onAccountSelect }: GoogleAccountChooserProps) {
    const accounts = [
        { name: 'Joh doe', email: 'jhndoe23333@gmail.com' },
        { name: 'Joh doe', email: 'doejohn20235@gmail.com' },
        { name: 'Joh doe', email: 'johndoe2025@gmail.com' },
    ];

    const handleSelectAccount = (email: string) => {
        console.log('Selected account:', email);
        onAccountSelect(email);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={styles.modalContainer}
                >
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.infoIcon}>
                            <Ionicons name="help-circle-outline" size={24} color="#666666" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#1D1E1F" />
                        </TouchableOpacity>
                    </View>

                    {/* Google Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.googleLogo}>G</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Sign up on Tunzaa</Text>
                    <Text style={styles.subtitle}>Choose an account</Text>
                    <Text style={styles.subtitle2}>to continue to Tunzaa</Text>

                    {/* Account List */}
                    <View style={styles.accountsContainer}>
                        {accounts.map((account, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.accountRow}
                                onPress={() => handleSelectAccount(account.email)}
                            >
                                <View style={styles.avatar}>
                                    <Ionicons name="person-circle" size={40} color="#9CA3AF" />
                                </View>
                                <View style={styles.accountInfo}>
                                    <Text style={styles.accountName}>{account.name}</Text>
                                    <Text style={styles.accountEmail}>{account.email}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* Add Another Account */}
                        <TouchableOpacity style={styles.addAccountRow}>
                            <View style={styles.addAccountIcon}>
                                <Ionicons name="person-add-outline" size={24} color="#666666" />
                            </View>
                            <Text style={styles.addAccountText}>Add another account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footerLinks}>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>privacy policy</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerSeparator}>•</Text>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>terms of service</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    infoIcon: {
        opacity: 0.6,
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },

    googleLogo: {
        fontSize: 72,
        fontWeight: '700',
        color: '#1D1E1F',
    },

    // Title
    title: {
        fontFamily: 'System',
        fontSize: 20,
        fontWeight: '600',
        color: '#1D1E1F',
        textAlign: 'center',
        marginBottom: 8,
    },

    subtitle: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },

    subtitle2: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
    },

    // Accounts
    accountsContainer: {
        marginBottom: 20,
    },

    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
    },

    avatar: {
        marginRight: 12,
    },

    accountInfo: {
        flex: 1,
    },

    accountName: {
        fontFamily: 'System',
        fontSize: 15,
        fontWeight: '600',
        color: '#1D1E1F',
        marginBottom: 2,
    },

    accountEmail: {
        fontFamily: 'System',
        fontSize: 13,
        color: '#666666',
    },

    // Add Account
    addAccountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    addAccountIcon: {
        marginRight: 12,
    },

    addAccountText: {
        fontFamily: 'System',
        fontSize: 15,
        fontWeight: '500',
        color: '#1D1E1F',
    },

    // Footer
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },

    footerLink: {
        fontFamily: 'System',
        fontSize: 12,
        color: '#3B5191',
    },

    footerSeparator: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

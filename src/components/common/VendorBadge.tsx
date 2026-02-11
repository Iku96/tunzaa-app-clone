import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VendorBadgeProps {
    name: string;
    location: string;
    showIcon?: boolean;
}

export default function VendorBadge({ name, location, showIcon = true }: VendorBadgeProps) {
    return (
        <View style={styles.container}>
            {showIcon && (
                <View style={styles.iconContainer}>
                    <Ionicons name="storefront" size={12} color="#FFFFFF" />
                </View>
            )}
            <View>
                <View style={styles.row}>
                    <Text style={styles.name}>{name}</Text>
                    {/* Simplified verification checkmark if needed */}
                </View>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={10} color="#6B7280" />
                    <Text style={styles.location}>{location}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444', // Voda Red or similar
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    name: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1F2937',
        textTransform: 'uppercase',
    },
    location: {
        fontSize: 10,
        color: '#6B7280',
    },
});

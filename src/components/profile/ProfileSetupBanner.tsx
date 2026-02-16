import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileSetupBannerProps {
    progress?: number;
    points?: number;
    onPress?: () => void;
}

export default function ProfileSetupBanner({ progress = 0.5, points = 50, onPress }: ProfileSetupBannerProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark" size={20} color="#4B5563" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Complete profile setup</Text>
                    <Text style={styles.subtitle}>Earn {points} points & unlock special rewards</Text>
                </View>
                <View style={styles.progressContainer}>
                    <View style={styles.circularProgress}>
                        <Ionicons name="speedometer-outline" size={24} color="#425BA4" />
                    </View>
                </View>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        marginHorizontal: 20,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#425BA4',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressContainer: {
        marginLeft: 12,
    },
    circularProgress: {
        // Placeholder for a circular progress indicator if needed, 
        // for now just an icon as per screenshot approximation
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 2,
    },
});

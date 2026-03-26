import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WebviewScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Mock Browser Header */}
            <View style={styles.browserHeader}>
                <View style={styles.urlBar}>
                    <Text style={styles.aaText}>AA</Text>
                    <View style={styles.urlWrapper}>
                        <Ionicons name="lock-closed" size={12} color="#1A1A1A" style={{ marginRight: 4 }} />
                        <Text style={styles.urlText}>https://tunzaa.co.tz/en/terms-of-service</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>Karibu Tunzaa</Text>

                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800' }}
                    style={styles.heroImage}
                />

                <Text style={styles.statementText}>
                    Respecting{'\n'}your privacy{'\n'}is our priority.
                </Text>

                <Text style={styles.docTitle}>Terms and Conditions</Text>
                <Text style={styles.publishedDate}>Published on: April 17, 2021</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    browserHeader: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    urlBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    aaText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        letterSpacing: 1,
    },
    urlWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    urlText: {
        fontSize: 13,
        color: '#1A1A1A',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 24,
    },
    heroImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 40,
        resizeMode: 'cover',
    },
    statementText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#425BA4',
        lineHeight: 40,
        marginBottom: 48,
    },
    docTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#425BA4',
        marginBottom: 8,
    },
    publishedDate: {
        fontSize: 13,
        color: '#6B7280',
    },
});

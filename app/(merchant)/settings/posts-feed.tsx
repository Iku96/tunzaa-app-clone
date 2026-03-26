import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Heart, Send, Bookmark, MoreHorizontal, Grid } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PostsFeedScreen() {
    const router = useRouter();

    // New account: starts with zero data
    const posts: any[] = [];

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Grid size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Posts about your business will appear here.</Text>
        </View>
    );

    const renderPost = ({ item }: { item: any }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                    <Text style={styles.userName}>{item.user.name}</Text>
                </View>
                <TouchableOpacity>
                    <MoreHorizontal size={20} color="#111827" />
                </TouchableOpacity>
            </View>

            <Image source={{ uri: item.image }} style={styles.postImage} />

            <View style={styles.actionRow}>
                <View style={styles.leftActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Heart size={24} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MessageCircle size={24} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Send size={24} color="#111827" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity>
                    <Bookmark size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <View style={styles.postContent}>
                <Text style={styles.likesText}>{item.likes.toLocaleString()} likes</Text>
                <Text style={styles.captionText}>
                    <Text style={styles.captionUser}>{item.user.name} </Text>
                    {item.caption}
                </Text>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
    postCard: {
        marginBottom: 20,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    postImage: {
        width: width,
        height: width,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    leftActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        padding: 2,
    },
    postContent: {
        paddingHorizontal: 12,
    },
    likesText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    captionText: {
        fontSize: 14,
        color: '#111827',
        lineHeight: 20,
    },
    captionUser: {
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    }
});

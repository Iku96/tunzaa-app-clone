import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
    { id: '1', name: 'Fashion', icon: 'shirt-outline' },
    { id: '2', name: 'Electronics', icon: 'phone-portrait-outline' },
    { id: '3', name: 'Home', icon: 'home-outline' },
    { id: '4', name: 'Books', icon: 'book-outline' },
    { id: '5', name: 'Games', icon: 'game-controller-outline' },
    { id: '6', name: 'Sports', icon: 'basketball-outline' },
    { id: '7', name: 'Cosmetic', icon: 'color-palette-outline' },
    { id: '8', name: 'Car', icon: 'car-sport-outline' },
];

export default function CategoryGrid() {
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.item}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon || 'grid-outline'} size={24} color="#4B5563" />
            </View>
            <Text style={styles.label}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={CATEGORIES}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={4}
                scrollEnabled={false} // Since it's inside a ScrollView usually
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeAll: {
        fontSize: 14,
        color: '#425BA4',
        fontWeight: '500',
    },
    list: {
        gap: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    item: {
        alignItems: 'center',
        width: '22%',
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#F3F4F6',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: '#4B5563',
        textAlign: 'center',
    }
});

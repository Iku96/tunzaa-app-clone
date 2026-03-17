import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter, LayoutGrid, Download, Plus } from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Mock Data
const INVENTORY_DATA = [
    { id: '1', product: 'Total Beats Air', model: 'AirPods Max', price: '140,000/=', stock: 24, status: 'In Stock' },
    { id: '2', product: 'Home Bass Rocks', model: 'Bluetooth Speaker', price: '130,000/=', stock: 5, status: 'Low Stock' },
    { id: '3', product: 'Wireless Charger', model: 'Qi Pad', price: '45,000/=', stock: 0, status: 'Out of Stock' },
    { id: '4', product: 'Smart Watch X', model: 'Series 7', price: '250,000/=', stock: 12, status: 'In Stock' },
];

export default function InventoryScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    // Donut Chart Logic (Mock values)
    const size = 180;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Percentages: In Stock (77%), Low Stock (16%), Out of Stock (6%)
    const inStock = 77;
    const lowStock = 16;
    const outOfStock = 7;

    const inStockOffset = 0;
    const lowStockOffset = (inStock / 100) * circumference;
    const outOfStockOffset = ((inStock + lowStock) / 100) * circumference;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventory</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(merchant)/add-product')}>
                    <Plus size={24} color="#3A5BA9" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Inventory Status</Text>

                {/* Donut Chart Component */}
                <View style={styles.chartContainer}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            {/* In Stock - Green */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#01AC00"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={0}
                                fill="transparent"
                            />
                            {/* Low Stock - Orange/Red */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#FBBF24"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (lowStock / 100) * circumference}
                                fill="transparent"
                                rotation={(inStock / 100) * 360}
                                origin={`${size / 2}, ${size / 2}`}
                            />
                            {/* Out of Stock - Grey */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#6B7280"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (outOfStock / 100) * circumference}
                                fill="transparent"
                                rotation={((inStock + lowStock) / 100) * 360}
                                origin={`${size / 2}, ${size / 2}`}
                            />
                        </G>
                    </Svg>
                </View>

                {/* Chart Legend Labels */}
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#01AC00' }]} />
                        <Text style={styles.legendText}>In Stock (24)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
                        <Text style={styles.legendText}>Low Stock (05)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#6B7280' }]} />
                        <Text style={styles.legendText}>Out of stock (02)</Text>
                    </View>
                </View>

                {/* Search and Action Bar */}
                <View style={styles.searchRow}>
                    <View style={styles.searchInputContainer}>
                        <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            value={search}
                            onChangeText={setSearch}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <LayoutGrid size={20} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#425BA4' }]}>
                        <Download size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Filter Row */}
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Filter by</Text>
                    <TouchableOpacity style={styles.filterDropdown}>
                        <Filter size={14} color="#6B7280" style={{ marginRight: 6 }} />
                        <Text style={styles.filterText}>Status</Text>
                    </TouchableOpacity>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>PRODUCT</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>MODEL NUMBER</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>PRODUCT PRICE</Text>
                </View>

                {/* Table Content */}
                {INVENTORY_DATA.map((item, index) => (
                    <View key={item.id} style={[styles.tableRow, index % 2 === 1 && styles.alternateRow]}>
                        <Text style={[styles.tableRowText, { flex: 2 }]} numberOfLines={1}>{item.product}</Text>
                        <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'center' }]} numberOfLines={1}>{item.model}</Text>
                        <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right' }]}>{item.price}</Text>
                    </View>
                ))}

                {/* Pagination Placeholder */}
                <View style={styles.paginationRow}>
                    <Text style={styles.paginationText}>10 results per page</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginBottom: 20,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    iconBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#01AC00',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 10,
    },
    filterDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    filterText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    tableHeaderText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#9CA3AF',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
    },
    alternateRow: {
        backgroundColor: '#F9FAFB',
    },
    tableRowText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },
    paginationRow: {
        alignItems: 'flex-end',
        marginTop: 20,
        paddingBottom: 20,
    },
    paginationText: {
        fontSize: 12,
        color: '#9CA3AF',
    }
});

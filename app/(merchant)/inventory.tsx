import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter, LayoutGrid, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { productsApi, Product } from '../../src/services/products';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

export default function InventoryScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Get vendor profile 
    const vendorProfile = user?.profiles?.find(p => p.role === 'vendor' || p.role === 'business') as any;
    const vendorId = vendorProfile?.metadata?.vendor_id || vendorProfile?.vendor_id;

    const fetchProducts = async () => {
        if (!vendorId) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const response = await productsApi.getProducts({
                vendor_id: vendorId,
                skip: (page - 1) * limit,
                limit: limit,
                query: search || undefined
            });
            setProducts(response.items);
            setTotal(response.total);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, limit, vendorId]);

    // Handle search with debounce in a real app, but for now simple trigger
    const handleSearch = () => {
        if (page !== 1) setPage(1);
        else fetchProducts();
    };

    // Donut Chart Logic (Mock or semi-real)
    const size = 180;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // For now, these remain mock for visual representation
    const inStock = 77;
    const lowStock = 16;
    const outOfStock = 7;

    const totalPages = Math.ceil(total / limit);

    const renderPagination = () => {
        if (total === 0) return null;

        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <View style={styles.paginationFooter}>
                <Text style={styles.resultsCountText}>
                    Showing {Math.min(total, (page - 1) * limit + 1)} to {Math.min(total, page * limit)} of {total} results
                </Text>
                
                <View style={styles.pagerContainer}>
                    <TouchableOpacity 
                        style={[styles.pagerBtn, page === 1 && styles.pagerBtnDisabled]} 
                        onPress={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft size={20} color={page === 1 ? "#9CA3AF" : "#111827"} />
                    </TouchableOpacity>

                    {startPage > 1 && (
                        <>
                            <TouchableOpacity style={styles.pagerBtn} onPress={() => setPage(1)}>
                                <Text style={styles.pagerText}>1</Text>
                            </TouchableOpacity>
                            {startPage > 2 && <Text style={styles.pagerDots}>...</Text>}
                        </>
                    )}

                    {pages.map(p => (
                        <TouchableOpacity 
                            key={p} 
                            style={[styles.pagerBtn, page === p && styles.pagerBtnActive]}
                            onPress={() => setPage(p)}
                        >
                            <Text style={[styles.pagerText, page === p && styles.pagerTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <Text style={styles.pagerDots}>...</Text>}
                            <TouchableOpacity style={styles.pagerBtn} onPress={() => setPage(totalPages)}>
                                <Text style={styles.pagerText}>{totalPages}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity 
                        style={[styles.pagerBtn, page === totalPages && styles.pagerBtnDisabled]} 
                        onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                    >
                        <ChevronRight size={20} color={page === totalPages || totalPages === 0 ? "#9CA3AF" : "#111827"} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

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
                    <View style={styles.chartCenterText}>
                        <Text style={styles.chartCenterNumber}>{total}</Text>
                        <Text style={styles.chartCenterLabel}>Products</Text>
                    </View>
                </View>

                {/* Chart Legend Labels */}
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#01AC00' }]} />
                        <Text style={styles.legendText}>In Stock</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
                        <Text style={styles.legendText}>Low Stock</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#6B7280' }]} />
                        <Text style={styles.legendText}>Out of stock</Text>
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
                            onSubmitEditing={handleSearch}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleSearch}>
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
                    <Text style={[styles.tableHeaderText, { flex: 2.2 }]}>PRODUCT</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>MODEL NUMBER</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>PRODUCT PRICE</Text>
                </View>

                {/* Table Content */}
                {loading ? (
                    <ActivityIndicator size="large" color="#3A5BA9" style={{ marginVertical: 30 }} />
                ) : products.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products found</Text>
                    </View>
                ) : (
                    products.map((item, index) => (
                        <View key={item._id} style={[styles.tableRow, index % 2 === 1 && styles.alternateRow]}>
                            <Text style={[styles.tableRowText, { flex: 2.2 }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'center' }]} numberOfLines={1}>{item.sku || '---'}</Text>
                            <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right' }]}>{item.base_price.toLocaleString()}/=</Text>
                        </View>
                    ))
                )}

                {/* Pagination */}
                {renderPagination()}
                
                {/* Results per page selection placeholder */}
                <View style={styles.resultsPerPageRow}>
                    <Text style={styles.resultsPerPageText}>{limit} results per page</Text>
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
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
    chartCenterText: {
        position: 'absolute',
        alignItems: 'center',
    },
    chartCenterNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
    },
    chartCenterLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    paginationFooter: {
        marginTop: 30,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 20,
    },
    resultsCountText: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 16,
    },
    pagerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    pagerBtn: {
        minWidth: 36,
        height: 36,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pagerBtnActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    pagerBtnDisabled: {
        opacity: 0.5,
    },
    pagerText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    pagerTextActive: {
        color: '#FFFFFF',
    },
    pagerDots: {
        color: '#9CA3AF',
        fontSize: 16,
        paddingHorizontal: 4,
    },
    resultsPerPageRow: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    resultsPerPageText: {
        fontSize: 12,
        color: '#9CA3AF',
    }
});

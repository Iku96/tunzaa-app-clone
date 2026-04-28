import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter, LayoutGrid, Download, Plus, ChevronLeft, ChevronRight, ChevronDown, PlusSquare, Check } from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { productsApi, Product } from '../../src/services/products';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import AddProductModal from '../../src/components/merchant/AddProductModal';

const { width } = Dimensions.get('window');

export default function InventoryScreen() {
    const router = useRouter();
    const { user, setIsSidebarOpen } = useTunzaaAuth();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [stats, setStats] = useState({ inStock: 0, lowStock: 0, outOfStock: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);

    // Get vendor profile 
    const vendorProfile = user?.profiles?.find(p => p.role === 'vendor' || p.role === 'business') as any;
    const vendorId = vendorProfile?.metadata?.vendor_id || vendorProfile?.vendor_id;

    const fetchInventoryStats = async () => {
        if (!vendorId) return;
        try {
            setStatsLoading(true);
            // Fetch a larger sample to calculate distribution
            const response = await productsApi.getProducts({
                vendor_id: vendorId,
                limit: 100, // Max limit allowed by server is 100
            });
            
            let inS = 0, lowS = 0, outS = 0;
            if (response.items && Array.isArray(response.items)) {
                response.items.forEach(p => {
                    const qty = p.inventory_quantity || 0;
                    const threshold = p.low_stock_threshold || 5;
                    if (qty <= 0) outS++;
                    else if (qty <= threshold) lowS++;
                    else inS++;
                });
            }
            setStats({ inStock: inS, lowStock: lowS, outOfStock: outS });
        } catch (error: any) {
            // Silently handle empty inventory or common errors
            if (error?.status !== 404 && error?.status !== 422) {
                console.log('💡 [Inventory] Stats fetch skip (expected if empty or new vendor)');
            }
        } finally {
            setStatsLoading(false);
        }
    };

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
        } catch (error: any) {
            if (error?.status !== 404 && error?.status !== 422) {
                console.log('💡 [Inventory] Products fetch skip (expected if empty)');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryStats();
    }, [vendorId]);

    useEffect(() => {
        fetchProducts();
    }, [page, limit, vendorId]);

    // Handle search with debounce in a real app, but for now simple trigger
    const handleSearch = () => {
        if (page !== 1) setPage(1);
        else fetchProducts();
    };

    // Donut Chart Logic
    const size = 200;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const totalStats = stats.inStock + stats.lowStock + stats.outOfStock || 1;
    const inStockPct = (stats.inStock / totalStats) * 100;
    const lowStockPct = (stats.lowStock / totalStats) * 100;
    const outOfStockPct = (stats.outOfStock / totalStats) * 100;

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
                <Text style={styles.resultsCountText}>
                    Showing {Math.min(total, (page - 1) * limit + 1)} to {Math.min(total, page * limit)} of {total} results
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.headerBtn}>
                    <LayoutGrid size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventory</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
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
                                strokeDashoffset={circumference - (lowStockPct / 100) * circumference}
                                fill="transparent"
                                rotation={(inStockPct / 100) * 360}
                                origin={`${size / 2}, ${size / 2}`}
                            />
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#EF4444"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (outOfStockPct / 100) * circumference}
                                fill="transparent"
                                rotation={((inStockPct + lowStockPct) / 100) * 360}
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
                        <Text style={styles.legendText}>In Stock({stats.inStock})</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
                        <Text style={styles.legendText}>Low Stock({stats.lowStock})</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.legendText}>Out of stock({stats.outOfStock})</Text>
                    </View>
                </View>

                {/* Search and Action Bar */}
                <View style={styles.searchRow}>
                    <View style={styles.searchInputContainer}>
                        <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search...."
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={handleSearch}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <TouchableOpacity 
                        style={styles.greenSquareBtn}
                        onPress={() => setIsAddModalVisible(true)}
                    >
                        <PlusSquare size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.blueSquareBtn}>
                        <Download size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Results and Filter Row */}
                <View style={styles.resultsHeaderRow}>
                    <View style={styles.resultsPerPageContainer}>
                        <Text style={styles.resultsLabel}>Show</Text>
                        <TouchableOpacity 
                            style={styles.limitDropdown}
                            onPress={() => setIsLimitModalVisible(true)}
                        >
                            <Text style={styles.limitText}>{limit}</Text>
                            <ChevronDown size={14} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.resultsLabel}>entries</Text>
                    </View>
                    
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterByLabel}>Filter by</Text>
                        <TouchableOpacity style={styles.filterDropdown}>
                            <Text style={styles.filterValueText}>Status</Text>
                            <ChevronDown size={14} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>PRODUCT</Text>
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
                        <View key={item.product_id || item._id || index} style={styles.tableRow}>
                            <Text style={[styles.tableRowText, { flex: 2, fontWeight: '700' }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'center' }]} numberOfLines={1}>{item.sku || '---'}</Text>
                            <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right' }]}>{item.base_price.toLocaleString()}/=</Text>
                        </View>
                    ))
                )}

                {/* Pagination */}
                {renderPagination()}

            </ScrollView>

            <AddProductModal 
                visible={isAddModalVisible} 
                onClose={() => setIsAddModalVisible(false)}
                onSuccess={() => {
                    setIsAddModalVisible(false);
                    fetchProducts();
                }}
            />

            {/* Limit Selection Modal */}
            <Modal
                visible={isLimitModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsLimitModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsLimitModalVisible(false)}
                >
                    <View style={styles.limitModalContent}>
                        <Text style={styles.limitModalTitle}>Show items per page</Text>
                        {[10, 20, 50, 100].map((val) => (
                            <TouchableOpacity 
                                key={val}
                                style={[styles.limitOption, limit === val && styles.limitOptionActive]}
                                onPress={() => {
                                    setLimit(val);
                                    setPage(1);
                                    setIsLimitModalVisible(false);
                                }}
                            >
                                <Text style={[styles.limitOptionText, limit === val && styles.limitOptionTextActive]}>
                                    {val} items
                                </Text>
                                {limit === val && <Check size={18} color="#01AC00" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
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
        height: 220,
        marginBottom: 20,
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
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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
    greenSquareBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#01AC00',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blueSquareBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#425BA4',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    resultsPerPageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultsLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginHorizontal: 8,
    },
    limitDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    limitText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginRight: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    limitModalContent: {
        width: width * 0.8,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 5,
    },
    limitModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    limitOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    limitOptionActive: {
        backgroundColor: '#F0FDF4',
    },
    limitOptionText: {
        fontSize: 16,
        color: '#374151',
    },
    limitOptionTextActive: {
        color: '#01AC00',
        fontWeight: '600',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterByLabel: {
        fontSize: 14,
        color: '#111827',
        marginRight: 12,
    },
    filterDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    filterValueText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        marginRight: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 0.2,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tableRowText: {
        fontSize: 13,
        color: '#111827',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
    paginationFooter: {
        marginTop: 30,
        paddingBottom: 40,
        gap: 20,
    },
    resultsCountText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#9CA3AF',
    },
    pagerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    pagerBtn: {
        width: 40,
        height: 40,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pagerBtnActive: {
        backgroundColor: '#3A5BA9',
        borderColor: '#3A5BA9',
    },
    pagerBtnDisabled: {
        opacity: 0.3,
    },
    pagerText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: 'bold',
    },
    pagerTextActive: {
        color: '#FFFFFF',
    },
    pagerDots: {
        color: '#9CA3AF',
        fontSize: 16,
        paddingHorizontal: 4,
    }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface FilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
}

export default function FilterBottomSheet({ visible, onClose }: FilterBottomSheetProps) {
    const [activeColor, setActiveColor] = useState('Newest');
    const [isNearby, setIsNearby] = useState(false);
    const [viewAs, setViewAs] = useState('Gallery');

    const renderRadioRow = (label: string) => {
        const isActive = activeColor === label;
        return (
            <TouchableOpacity style={styles.radioRow} onPress={() => setActiveColor(label)}>
                <Text style={styles.radioLabel}>{label}</Text>
                <View style={[styles.outerCircle, isActive && styles.outerCircleActive]}>
                    {isActive && <View style={styles.innerCircle} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.sheetContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.pullIndicator} />
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>Filter</Text>
                            <TouchableOpacity style={styles.clearBtn}>
                                <Text style={styles.clearBtnText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Color Section */}
                    <View style={styles.section}>
                        <View style={styles.accordionHeader}>
                            <Text style={styles.sectionTitle}>Color</Text>
                            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                        </View>
                        <View style={styles.radioGroup}>
                            {renderRadioRow('Newest')}
                            {renderRadioRow('Oldest')}
                            {renderRadioRow('Price: High to low')}
                            {renderRadioRow('Price: Low to high')}
                        </View>
                    </View>

                    {/* More Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>More</Text>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Nearby shops</Text>
                            <Switch
                                trackColor={{ false: '#F3F4F6', true: '#BFDBFE' }}
                                thumbColor={isNearby ? '#3B82F6' : '#FFFFFF'}
                                ios_backgroundColor="#F3F4F6"
                                onValueChange={setIsNearby}
                                value={isNearby}
                                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            />
                        </View>
                    </View>

                    {/* View As Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>View as</Text>
                        <View style={styles.segmentedControl}>
                            <TouchableOpacity
                                style={[styles.segmentBtn, viewAs === 'List' && styles.segmentBtnActive]}
                                onPress={() => setViewAs('List')}
                            >
                                <Ionicons name="list" size={16} color={viewAs === 'List' ? "#1F2937" : "#6B7280"} />
                                <Text style={[styles.segmentText, viewAs === 'List' && styles.segmentTextActive]}>List</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segmentBtn, viewAs === 'Gallery' && styles.segmentBtnActive]}
                                onPress={() => setViewAs('Gallery')}
                            >
                                <Ionicons name="grid" size={16} color={viewAs === 'Gallery' ? "#1F2937" : "#6B7280"} />
                                <Text style={[styles.segmentText, viewAs === 'Gallery' && styles.segmentTextActive]}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer Apply Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34, // Safe area for iOS
        maxHeight: height * 0.9,
    },
    pullIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    clearBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    clearBtnText: {
        fontSize: 12,
        color: '#4B5563',
    },
    section: {
        marginBottom: 24,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    radioGroup: {
        gap: 16,
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    radioLabel: {
        fontSize: 14,
        color: '#374151',
    },
    outerCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outerCircleActive: {
        borderColor: '#4A55A2',
    },
    innerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4A55A2',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 14,
        color: '#374151',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    segmentBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    segmentBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    segmentTextActive: {
        color: '#1F2937',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 16,
    },
    applyButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

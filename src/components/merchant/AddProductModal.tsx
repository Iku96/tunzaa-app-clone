import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { X, ChevronDown, Check, Camera, Plus, Trash2, CheckCircle2, PlusSquare } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCategories } from '../../services/categories';
import { useCreateProduct } from '../../services/product-management';
import { useTunzaaAuth } from '../../contexts/TunzaaAuthContext';
import { uploadApi } from '../../services/upload';
import { productsApi } from '../../services/products';
import { useMemo } from 'react';

const { width, height: screenHeight } = Dimensions.get('window');

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type ProductType = 'Product' | 'Services';

export default function AddProductModal({ visible, onClose, onSuccess }: AddProductModalProps) {
    const { user } = useTunzaaAuth();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get vendor details
    const vendorProfile = user?.profiles?.find(p => p.role === 'vendor' || p.role === 'business') as any;
    const vendorId = vendorProfile?.metadata?.vendor_id || vendorProfile?.vendor_id;
    const storeId = vendorProfile?.metadata?.store_id || vendorProfile?.store_id;

    // Step 1 State
    const [name, setName] = useState('');
    const [type, setType] = useState<ProductType>('Product');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    // Brand Suggestions State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Step 2 State
    const [weightUnit, setWeightUnit] = useState('KG');
    const [weightValue, setWeightValue] = useState('0');
    const [colors, setColors] = useState<{name: string, hex: string}[]>([]);
    const [localImages, setLocalImages] = useState<string[]>([]);
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('0');

    // Step 3 State
    const [modelNumber, setModelNumber] = useState('');
    const [measureUnit, setMeasureUnit] = useState('KG');
    const [dimHeight, setDimHeight] = useState('0');
    const [dimWidth, setDimWidth] = useState('0');
    const [dimLength, setDimLength] = useState('0');

    const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ limit: 100 });
    const createProductMutation = useCreateProduct();

    // Debounced Search for Brand Suggestions
    useEffect(() => {
        if (!name || name.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await productsApi.searchProducts(name, { limit: 5 });
                // Extract unique names and filter out exact matches if needed
                const uniqueNames = Array.from(new Set(response.items.map(p => p.name)));
                setSuggestions(uniqueNames);
                setShowSuggestions(uniqueNames.length > 0);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [name]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 1,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setLocalImages([...localImages, ...newImages].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setLocalImages(localImages.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        if (!vendorId || !storeId) {
            alert('Vendor or Store ID not found. Please ensure your profile is fully set up.');
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. Upload images if any
            const uploadedImages: { url: string; is_primary: boolean }[] = [];
            for (let i = 0; i < localImages.length; i++) {
                const uri = localImages[i];
                const filename = uri.split('/').pop() || `product-image-${i}.jpg`;
                const uploadResult = await uploadApi.uploadFile(uri, filename);
                uploadedImages.push({
                    url: uploadResult.url,
                    is_primary: i === 0
                });
            }

            // 2. Prepare payload
            const payload = {
                vendor_id: vendorId,
                store_id: storeId,
                name,
                slug: name.toLowerCase().replace(/ /g, '-'),
                description,
                sku: modelNumber,
                category_ids: [categoryId],
                base_price: parseFloat(price.replace(/,/g, '')),
                inventory_quantity: parseInt(stock, 10),
                weight: parseFloat(weightValue),
                dimensions: {
                    length: parseFloat(dimLength),
                    width: parseFloat(dimWidth),
                    height: parseFloat(dimHeight)
                },
                images: uploadedImages,
                has_variants: colors.length > 0,
            };

            await createProductMutation.mutateAsync(payload);
            setShowSuccess(true);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCategory = categoriesData?.items.find(c => c.category_id === categoryId);

    const renderStepIndicators = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= 3 && styles.stepNumberActive]}>3</Text>
            </View>
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.requiredText}>*-Require</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name<Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Samsung"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        if (!text) setShowSuggestions(false);
                    }}
                    placeholderTextColor="#9CA3AF"
                    onBlur={() => {
                        // Small delay to allow clicking suggestions
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                />
                
                {isSearching && (
                    <View style={styles.searchingContainer}>
                        <ActivityIndicator size="small" color="#3A5BA9" />
                        <Text style={styles.searchingText}>Searching suggestions...</Text>
                    </View>
                )}

                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        {suggestions.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.suggestionItem}
                                onPress={() => {
                                    setName(item);
                                    setShowSuggestions(false);
                                }}
                            >
                                <Text style={styles.suggestionText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type of Product<Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.radioRow}>
                    <TouchableOpacity 
                        style={styles.radioItem} 
                        onPress={() => setType('Product')}
                    >
                        <View style={[styles.radioButton, type === 'Product' && styles.radioActive]}>
                            {type === 'Product' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>Product</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.radioItem} 
                        onPress={() => setType('Services')}
                    >
                        <View style={[styles.radioButton, type === 'Services' && styles.radioActive]}>
                            {type === 'Services' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>Services</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category<Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setShowCategoryModal(true)}
                >
                    <Text style={[styles.dropdownText, !selectedCategory && styles.placeholderText]}>
                        {selectedCategory ? selectedCategory.name : 'Choose product category'}
                    </Text>
                    <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Information about product<Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your product..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.requiredText}>*-Require</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight<Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.dropdown, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.dropdownText}>{weightUnit}</Text>
                        <ChevronDown size={14} color="#6B7280" />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { flex: 2 }]}
                        keyboardType="numeric"
                        value={weightValue}
                        onChangeText={setWeightValue}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color<Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.colorsRow}>
                    <TouchableOpacity style={styles.variantBtn}>
                        <Text style={styles.variantBtnText}>Product Images({localImages.length})</Text>
                    </TouchableOpacity>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsScroll}>
                        {colors.map((c, i) => (
                            <View key={i} style={styles.colorPill}>
                                <View style={[styles.colorDot, { backgroundColor: c.hex }]} />
                                <Text style={styles.colorPillText}>{c.name}</Text>
                                <TouchableOpacity 
                                    style={styles.removeColorBtn}
                                    onPress={() => setColors(colors.filter((_, idx) => idx !== i))}
                                >
                                    <X size={10} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity 
                            style={styles.addColorBtn}
                            onPress={() => setColors([...colors, { name: 'Black', hex: '#000000' }])}
                        >
                            <Plus size={16} color="#3A5BA9" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Images<Text style={styles.requiredStar}>*</Text></Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                    <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                        <Camera size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                    {localImages.map((uri, index) => (
                        <View key={index} style={styles.imageBox}>
                            <Image source={{ uri }} style={styles.image} />
                            <TouchableOpacity style={styles.deleteImageBtn} onPress={() => removeImage(index)}>
                                <X size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product price<Text style={styles.requiredStar}>*</Text></Text>
                <Text style={styles.inputHelp}>This price will be visible to Tunzaa users.</Text>
                <View style={styles.priceInputContainer}>
                    <Text style={styles.pricePrefix}>Tsh.</Text>
                    <TextInput
                        style={styles.priceInput}
                        keyboardType="numeric"
                        placeholder="0"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of products<Text style={styles.requiredStar}>*</Text></Text>
                <Text style={styles.inputHelp}>Enter the number of products available.</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={stock}
                    onChangeText={setStock}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.requiredText}>*-Require</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name<Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                    style={[styles.input, { backgroundColor: '#F3F4F6' }]}
                    value={name}
                    editable={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Model Number<Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Model Number (e.g. SM0765B)"
                    value={modelNumber}
                    onChangeText={setModelNumber}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Measure</Text>
                <TouchableOpacity style={styles.dropdown}>
                    <Text style={styles.dropdownText}>{measureUnit}</Text>
                    <ChevronDown size={14} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={dimHeight}
                    onChangeText={setDimHeight}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Width</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={dimWidth}
                    onChangeText={setDimWidth}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Length</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={dimLength}
                    onChangeText={setDimLength}
                />
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Top Notch handle */}
                    <View style={styles.handle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Product</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {renderStepIndicators()}

                    <ScrollView 
                        style={styles.scrollContent} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={styles.backBtn} 
                            onPress={step === 1 ? onClose : handleBack}
                        >
                            <Text style={styles.backBtnText}>{step === 1 ? 'Cancel' : 'Return'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.continueBtn, isSubmitting && styles.continueBtnDisabled]} 
                            onPress={handleContinue}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.continueBtnText}>{step === 3 ? 'Finish' : 'Continue'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Category Selection Modal */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.subModalOverlay}>
                    <View style={styles.subModalContent}>
                        <View style={styles.subModalHeader}>
                            <Text style={styles.subModalTitle}>Choose Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        {categoriesLoading ? (
                            <ActivityIndicator style={{ padding: 40 }} color="#3A5BA9" />
                        ) : (
                            <ScrollView style={styles.categoryList}>
                                {categoriesData?.items.map((cat) => (
                                    <TouchableOpacity 
                                        key={cat.category_id} 
                                        style={styles.categoryItem}
                                        onPress={() => {
                                            setCategoryId(cat.category_id);
                                            setShowCategoryModal(false);
                                        }}
                                    >
                                        <Text style={[styles.categoryName, categoryId === cat.category_id && styles.categoryNameActive]}>
                                            {cat.name}
                                        </Text>
                                        {categoryId === cat.category_id && <Check size={18} color="#3A5BA9" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccess}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.subModalOverlay}>
                    <View style={styles.successModalContent}>
                        <TouchableOpacity 
                            style={styles.closeSuccessBtn}
                            onPress={() => {
                                setShowSuccess(false);
                                onClose();
                            }}
                        >
                            <X size={20} color="#111827" />
                        </TouchableOpacity>

                        <View style={styles.successIconContainer}>
                            <CheckCircle2 size={50} color="#01AC00" />
                        </View>

                        <Text style={styles.successTitle}>Your product has been successfully uploaded! 🎉</Text>
                        <Text style={styles.successSubtext}>
                            It's now live and ready for customers to buy from your store
                        </Text>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '92%',
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeBtn: {
        padding: 4,
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginBottom: 24,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: '#425BA4',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: '#F3F4F6', // Keep light as per screenshot
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    stepContent: {
        flex: 1,
    },
    requiredText: {
        fontSize: 14,
        color: '#A02000', // Deep red
        fontWeight: '600',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    requiredStar: {
        color: '#EA4335',
    },
    input: {
        borderWidth: 1,
        borderColor: '#F9FAFB', // Very subtle
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 100,
    },
    suggestButtonsRow: {
        flexDirection: 'column',
        gap: 8,
        marginTop: 12,
    },
    suggestBtn: {
        backgroundColor: '#EEF2FF', // Very light blue
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        width: '100%',
    },
    suggestBtnText: {
        color: '#111827',
        fontSize: 15,
        textAlign: 'center',
    },
    radioRow: {
        flexDirection: 'row',
        gap: 24,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    radioActive: {
        borderColor: '#D1D5DB',
    },
    radioInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#425BA4',
    },
    radioText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#F9FAFB',
    },
    dropdownText: {
        fontSize: 15,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    row: {
        flexDirection: 'row',
    },
    colorsRow: {
        flexDirection: 'column',
    },
    variantBtn: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    variantBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    colorsScroll: {
        marginBottom: 10,
    },
    colorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 10,
        gap: 8,
    },
    colorDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    colorPillText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    removeColorBtn: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#425BA4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addColorBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    imagesScroll: {
        flexDirection: 'row',
    },
    uploadBox: {
        width: 70,
        height: 70,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    imageBox: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 12,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    deleteImageBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputHelp: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 10,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
        height: 54,
    },
    pricePrefix: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 12,
    },
    backBtn: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    backBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    continueBtn: {
        flex: 1.5,
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueBtnDisabled: {
        opacity: 0.7,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    subModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
    },
    subModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    subModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    categoryList: {
        width: '100%',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryName: {
        fontSize: 15,
        color: '#4B5563',
    },
    categoryNameActive: {
        color: '#425BA4',
        fontWeight: 'bold',
    },
    successModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '90%',
        position: 'relative',
    },
    closeSuccessBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 12,
    },
    successSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    searchingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    searchingText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 8,
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 4,
        maxHeight: 200,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionText: {
        fontSize: 14,
        color: '#111827',
    },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronDown, Check, Camera, Plus, Trash2, ArrowLeft, RefreshCcw, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCategories } from '../../src/services/categories';
import { useCreateProduct } from '../../src/services/product-management';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { uploadApi } from '../../src/services/upload';

const { width } = Dimensions.get('window');

type ProductType = 'Product' | 'Services';

export default function AddProductScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get vendor details
    const vendorProfile = user?.profiles?.find(p => p.role === 'vendor' || p.role === 'business') as any;
    const vendorId = vendorProfile?.profile_id || vendorProfile?.metadata?.vendor_id || vendorProfile?.vendor_id;
    const storeId = vendorProfile?.profile_id || vendorProfile?.metadata?.store_id || vendorProfile?.store_id;


    // Step 1 State
    const [name, setName] = useState('');
    const [type, setType] = useState<ProductType>('Product');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);

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
    const [height, setHeight] = useState('0');
    const [widthVal, setWidthVal] = useState('0');
    const [length, setLength] = useState('0');

    const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ limit: 100 });
    const createProductMutation = useCreateProduct();

    const pickImage = async () => {
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
        } else {
            router.back();
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
                const filename = `product_${Date.now()}_${i}.jpg`;
                const uploadResult = await uploadApi.uploadFile(localImages[i], filename);
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
                sku: modelNumber || `SKU-${Date.now()}`,
                category_ids: [categoryId],
                base_price: parseFloat(price.replace(/,/g, '')) || 0,
                inventory_quantity: parseInt(stock, 10) || 0,
                weight: parseFloat(weightValue) || 1,
                dimensions: {
                    length: parseFloat(length) || 1,
                    width: parseFloat(widthVal) || 1,
                    height: parseFloat(height) || 1
                },
                images: uploadedImages,
                has_variants: colors.length > 0,
                // Add variants if needed based on colors
            };

            await createProductMutation.mutateAsync(payload);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCategory = categoriesData?.items.find(c => c.category_id === categoryId);

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.requiredText}>*-Require</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name<Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter product name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#9CA3AF"
                />
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
                    <ChevronDown size={20} color="#111827" />
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
                <TouchableOpacity style={styles.variantBtn}>
                    <Text style={styles.variantBtnText}>Product Images({localImages.length})</Text>
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsScroll}>
                    {[
                        { name: 'Black', color: '#000000' },
                        { name: 'Pinki', color: '#FFB6C1' },
                        { name: 'Purple', color: '#800080' }
                    ].map((c, i) => (
                        <View key={i} style={styles.colorPill}>
                            <View style={[styles.colorDot, { backgroundColor: c.color }]} />
                            <Text style={styles.colorPillText}>{c.name}</Text>
                            <TouchableOpacity style={styles.removeColorBtn}>
                                <X size={10} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addColorBtn}>
                        <Plus size={16} color="#3A5BA9" />
                    </TouchableOpacity>
                </ScrollView>
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
            <Text style={styles.requiredText}>Review your product details before finishing.</Text>

            <View style={styles.summaryBox}>
                <View style={styles.summarySection}>
                    <Text style={styles.summaryLabel}>Basic Information</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Name:</Text> {name || 'Not provided'}</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Type:</Text> {type}</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Category:</Text> {selectedCategory ? selectedCategory.name : 'Not provided'}</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Description:</Text> {description || 'Not provided'}</Text>
                </View>

                <View style={styles.summarySection}>
                    <Text style={styles.summaryLabel}>Details & Pricing</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Price:</Text> Tsh {price || '0'}</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Stock:</Text> {stock || '0'} available</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Weight:</Text> {weightValue || '0'} {weightUnit}</Text>
                    <Text style={styles.summaryText}><Text style={styles.summaryBold}>Images:</Text> {localImages.length} attached</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Product</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <X size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Stepper */}
                <View style={styles.stepperContainer}>
                    <View style={styles.stepperRow}>
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
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={handleBack}
                >
                    <Text style={styles.cancelBtnText}>{step === 1 ? 'Cancel' : 'Return'}</Text>
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

            {/* Category Selection Modal */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Category</Text>
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
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <TouchableOpacity 
                            style={styles.closeSuccessBtn}
                            onPress={() => {
                                setShowSuccess(false);
                                router.back();
                            }}
                        >
                            <X size={20} color="#111827" />
                        </TouchableOpacity>

                        <View style={styles.successIconContainer}>
                            <CheckCircle2 size={50} color="#3A5BA9" />
                        </View>

                        <Text style={styles.successTitle}>Your product has been successfully uploaded! 🎉</Text>
                        <Text style={styles.successSubtext}>
                            's now live and ready for customers to buy from your store
                        </Text>
                    </View>
                </View>
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
    stepperContainer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.7,
        justifyContent: 'center',
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: '#3A5BA9',
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepLine: {
        flex: 1,
        height: 4,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 8,
        borderRadius: 2,
    },
    stepLineActive: {
        backgroundColor: '#3A5BA9',
    },
    scrollContent: {
        padding: 20,
    },
    stepContent: {
        flex: 1,
    },
    requiredText: {
        fontSize: 14,
        color: '#EA4335',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 10,
    },
    requiredStar: {
        color: '#EA4335',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 100,
    },
    radioRow: {
        flexDirection: 'row',
        gap: 20,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: '#3A5BA9',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3A5BA9',
    },
    radioText: {
        fontSize: 14,
        color: '#111827',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
    },
    dropdownText: {
        fontSize: 14,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    row: {
        flexDirection: 'row',
    },
    variantBtn: {
        backgroundColor: '#3A5BA9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    variantBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    colorsScroll: {
        marginBottom: 10,
    },
    colorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginRight: 10,
        gap: 6,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    colorPillText: {
        fontSize: 12,
        color: '#111827',
    },
    removeColorBtn: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#3A5BA9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addColorBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
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
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    imageBox: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    deleteImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
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
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
        height: 50,
    },
    pricePrefix: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    continueBtn: {
        flex: 2,
        backgroundColor: '#3A5BA9',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    continueBtnDisabled: {
        opacity: 0.7,
    },
    continueBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    summaryBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summarySection: {
        marginBottom: 20,
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3A5BA9',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    summaryText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 6,
        lineHeight: 20,
    },
    summaryBold: {
        fontWeight: '600',
        color: '#111827',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    categoryList: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    categoryName: {
        fontSize: 15,
        color: '#111827',
    },
    categoryNameActive: {
        color: '#3A5BA9',
        fontWeight: '600',
    },
    successModalContent: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 30,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        position: 'relative',
    },
    closeSuccessBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 24,
    },
    successSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    }
});

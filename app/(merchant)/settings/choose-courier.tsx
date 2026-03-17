import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Truck, 
    Store, 
    AlertCircle, 
    Check, 
    List, 
    PlusCircle, 
    User as UserIcon 
} from 'lucide-react-native';

export default function ChooseCourierScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'courier' | 'pickup'>('courier');

    const StepIcon = ({ icon: Icon, label, step, active }: any) => (
        <View style={styles.stepItem}>
            <View style={[styles.stepIconWrapper, active && styles.activeStepIconWrapper]}>
                <Icon size={20} color={active ? '#3A5BA9' : '#D1D5DB'} />
            </View>
            <Text style={styles.stepStepText}>STEP {step}</Text>
            <Text style={styles.stepLabelText}>{label}</Text>
        </View>
    );

    const MethodOption = ({ id, icon: Icon, title, description, badge }: any) => {
        const isSelected = selectedMethod === id;
        return (
            <TouchableOpacity 
                style={[styles.methodCard, isSelected && styles.selectedMethodCard]} 
                onPress={() => setSelectedMethod(id)}
                activeOpacity={0.8}
            >
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>{title}</Text>
                    <Text style={styles.methodDescription}>{description}</Text>
                    <View style={styles.methodBadge}>
                        <Icon size={14} color="#3A5BA9" style={{ marginRight: 4 }} />
                        <Text style={styles.methodBadgeText}>{badge}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Your Courier</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Stepper */}
                <View style={styles.stepperContainer}>
                    <StepIcon icon={List} step={1} label="Choose Method" active={true} />
                    <View style={styles.stepLine} />
                    <StepIcon icon={PlusCircle} step={2} label="Choose courier" active={false} />
                    <View style={styles.stepLine} />
                    <StepIcon icon={UserIcon} step={3} label="Save address" active={false} />
                </View>

                <View style={styles.body}>
                    <Text style={styles.bodyTitle}>Choose Your Delivery Method</Text>
                    <Text style={styles.bodySubtitle}>Select how you want to receive your order</Text>

                    <MethodOption 
                        id="courier"
                        icon={Truck}
                        title="Courier Delivery"
                        description="Delivered to your address by our agent"
                        badge="Estimated delivery: 24-48 hours."
                    />

                    <MethodOption 
                        id="pickup"
                        icon={Store}
                        title="Self Pickup"
                        description="Collect from a designated store or collection point yourself."
                        badge="Ready for pickup within 2 hours."
                    />

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <View style={styles.infoIconWrapper}>
                            <AlertCircle size={20} color="#3A5BA9" />
                        </View>
                        <View style={styles.infoTextWrapper}>
                            <Text style={styles.infoTitle}>Delivery Information</Text>
                            <Text style={styles.infoContent}>
                                All delivery options include real-time tracking and notifications. Delivery times may vary based on your location and product availability.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.continueButton}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    stepItem: {
        alignItems: 'center',
        width: 80,
    },
    stepIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    activeStepIconWrapper: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    stepStepText: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
        marginBottom: 4,
    },
    stepLabelText: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
    },
    stepLine: {
        width: 30,
        height: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 20,
    },
    body: {
        padding: 24,
    },
    bodyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    bodySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    methodCard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    selectedMethodCard: {
        borderColor: '#E5E7EB',
        backgroundColor: '#FAFAFA',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 4,
    },
    radioActive: {
        borderColor: '#E5E7EB',
    },
    radioInner: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        borderWidth: 4,
        borderColor: '#3A5BA9',
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    methodDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 8,
    },
    methodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodBadgeText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F4FF',
        borderWidth: 1,
        borderColor: '#DCE4F8',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    infoIconWrapper: {
        marginRight: 12,
    },
    infoTextWrapper: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3A5BA9',
        marginBottom: 4,
    },
    infoContent: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
    continueButton: {
        backgroundColor: '#3A5BA9',
        borderRadius: 100,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

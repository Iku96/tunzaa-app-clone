import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Define slides data
const SLIDES = [
    {
        id: '1',
        title: 'Usimamizi Wa Bidhaa',
        description: 'Tunasahilisha mchakato wa usimamizi wa bidhaa kwa kutumia zana rahisi zetu ambazo unaweza kuongeza, kuhariri, na kufuta bidhaa kwa urahisi.',
        image: require('../assets/mauzo-intro-illustration.png'),
    },
    {
        id: '2',
        title: 'Usimamizi Wa Maagizo',
        description: 'Usimamie hisa zako, mauzo, na habari za wateja katika mahali pamoja, ili uweze kufikia data hii kwa urahisi popote na wakati wowote.',
        image: require('../assets/mauzo-intro-illustration screen 2.png'),
    },
    {
        id: '3',
        title: 'Usimamizi Wa Mfuko',
        description: 'Tumia zana yetu ya usimamizi wa fedha kuhakikisha uangalizi na kushughulikia mtiririko wa fedha wa taasisi ya kifedha.',
        image: require('../assets/mauzo-intro-illustration screen 3.png'),
    },
    {
        id: '4',
        title: 'Usimamizi Wa Utoaji',
        description: 'Inaendeshwa na zana za kidijitali ili kuhakikisha kuwa bidhaa zinasogezwa kwa usalama na kwa ufanisi hadi zimfikie mteja wa mwisho.',
        image: require('../assets/mauzo-intro-illustration screen 4.png'),
    },
];

export default function MauzoIntro() {
    const router = useRouter();
    const { flow } = useLocalSearchParams<{ flow: string }>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleBack = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
        } else {
            router.back();
        }
    };

    const handleCreateAccount = () => {
        if (flow === 'delivery') {
            router.push('/delivery-register');
        } else {
            router.push('/(merchant)/onboarding/step-2');
        }
    };

    const handleSkip = () => {
        if (flow === 'delivery') {
            router.push('/delivery-register');
        } else {
            router.push('/(merchant)/onboarding/step-2');
        }
    };

    // Update current index on scroll
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
        <View style={styles.slide}>
            {/* Illustration Area */}
            <View style={styles.imageContainer}>
                <Image
                    source={item.image}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </View>

            {/* Text Content */}
            <View style={styles.textWrapper}>
                <Text style={styles.title}>
                    {item.title}
                </Text>
                <Text style={styles.description}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>
                {/* Balance view for center alignment */}
                <View style={{ width: 40 }} />
            </View>

            {/* Carousel */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={32}
                bounces={false}
                style={{ flex: 1 }}
            />

            {/* Fixed Bottom Section */}
            <View style={styles.bottomSection}>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                {/* Main Action Button */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateAccount}
                    activeOpacity={0.8}
                >
                    <Text style={styles.createButtonText}>Create an account</Text>
                </TouchableOpacity>

                {/* Skip Link */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipText}>Skip</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4', // Confirmed Tunzaa Blue
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60, // Status bar spacing
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-SemiBold',
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    slide: {
        width: width,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    imageContainer: {
        height: height * 0.45, // Responsive height for illustration area
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    illustration: {
        width: '100%',
        height: '100%',
        maxHeight: 350,
    },
    textWrapper: {
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Gilroy-Bold',
    },
    description: {
        fontSize: 14,
        color: '#E0E7FF',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
        fontFamily: 'System',
        fontWeight: '400',
    },
    bottomSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 30,
        marginTop: 10,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    activeDot: {
        width: 32,
        backgroundColor: '#4ade80',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    createButton: {
        width: '100%',
        maxWidth: 320,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: '#01AC00',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});

import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Usimamizi Wa Mfuko',
        description: 'Tumia zana yetu ya usimamizi wa fedha kuhakikisha uangalizi na kushughulikia mtiririko wa fedha wa taasisi ya kifedha.',
        image: require('../assets/blue-tunzaa-logo.png'), // Placeholder, replace with actual asset if available
    },
    {
        id: '2',
        title: 'Usimamizi Wa Utoaji',
        description: 'Inaendeshwa na zana za kidijitali ili kuhakikisha kuwa bidhaa zinasogezwa kwa usalama na kwa ufanisi hadi zimfikie mteja wa mwisho.',
        image: require('../assets/blue-tunzaa-logo.png'), // Placeholder
    },
];

export default function MauzoIntro() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Navigate to register with merchant role
            router.push({ pathname: '/register', params: { role: 'merchant' } });
        }
    };

    const handleSkip = () => {
        router.push({ pathname: '/register', params: { role: 'merchant' } });
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
        } else {
            router.back();
        }
    };

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
        <View style={styles.slide}>
            <View style={styles.imageContainer}>
                {/* 
                   In a real implementation, distinct images would be used. 
                   Using the logo as a placeholder for now to match the blue theme.
                */}
                <Image
                    source={item.image}
                    style={styles.heroImage}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header: Back Arrow & Title */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>
                <View style={{ width: 24 }} />
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
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

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

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleNext}>
                    <Text style={styles.createButtonText}>
                        {currentIndex === SLIDES.length - 1 ? 'Create an account' : 'Next'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4', // Brand Blue
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    heroImage: {
        width: 250,
        height: 250,
        // Tint to white for visibility on blue bg if it's the logo, 
        // or remove tintColor if using colorful illustrations
        tintColor: '#FFFFFF'
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#E0E7FF', // Light blue/white text
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 30,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#4ade80', // Green accent
    },
    inactiveDot: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    footer: {
        paddingHorizontal: 20,
        marginBottom: 50,
        gap: 20,
    },
    createButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4ade80', // Green border
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PromoBanner() {
    return (
        <View style={styles.container}>
            {/* Background Gradient or Image */}
            <View style={styles.banner}>
                <View style={styles.content}>
                    <Text style={styles.title}>UP TO 80% OFF</Text>
                    <Text style={styles.subtitle}>Selected items heavily discounted!</Text>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>

                {/* Decorative Image (Placeholder) */}
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=3270&auto=format&fit=crop' }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    banner: {
        width: '100%',
        height: 160,
        backgroundColor: '#425BA4',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#E0E7FF',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#425BA4',
        fontWeight: 'bold',
        fontSize: 12,
    },
    image: {
        width: 140,
        height: 160,
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0.8,
    }
});

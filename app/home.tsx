import { View, Text } from 'react-native';

/**
 * Placeholder Home Screen
 * Will be replaced with the actual marketplace home screen.
 */
export default function HomeScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-brand-text text-xl font-semibold">Welcome to Tunzaa!</Text>
            <Text className="text-brand-muted text-base mt-2">Marketplace coming soon...</Text>
        </View>
    );
}

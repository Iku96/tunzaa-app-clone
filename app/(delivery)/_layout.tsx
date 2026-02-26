import { Stack } from 'expo-router';
import { DeliveryProvider } from '../../src/contexts/DeliveryContext';

export default function DeliveryLayout() {
    return (
        <DeliveryProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </DeliveryProvider>
    );
}

/**
 * Merchant Layout — Clean Stack wrapper.
 * Auth protection is handled centrally by AuthGuard in _layout.tsx.
 * No layout-level auth guards needed.
 */

import { Stack } from 'expo-router';

export default function MerchantLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' }
            }}
        />
    );
}
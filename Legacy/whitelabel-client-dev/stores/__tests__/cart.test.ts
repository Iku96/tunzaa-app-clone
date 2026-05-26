
import { createCrossPlatformStorage } from '../cart'; // We'll need to export this or test the store directly
import { Platform } from 'react-native';

// Mock Platform to simulate web
jest.mock('react-native', () => ({
    Platform: {
        OS: 'web',
        select: jest.fn(),
    },
    Appearance: {
        getColorScheme: jest.fn(() => 'light'),
        addChangeListener: jest.fn(),
        removeChangeListener: jest.fn(),
    },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

describe('Cart Store Storage Adapter', () => {
    const originalWindow = global.window;

    beforeEach(() => {
        // mitigation: ensure window is undefined to simulate SSR/Node environment
        // @ts-ignore
        delete global.window;
        // @ts-ignore
        delete global.localStorage;

        jest.resetModules();
    });

    afterEach(() => {
        // restore global window
        global.window = originalWindow;
    });

    it('should not crash when accessing storage in SSR environment (no window/localStorage)', async () => {
        // We need to import the module dynamically to ensure clean state if we were testing side-effects,
        // but here we are testing the adapter function if we can export it.
        // If not exported, we might need to rely on the store creation not crashing.

        // Since createCrossPlatformStorage is not exported in the original file,
        // we will likely need to export it to test it in isolation,
        // OR test the useCartStore behavior.

        const { useCartStore } = require('../cart');

        // Attempting to use the store which triggers storage access
        expect(() => {
            useCartStore.persist.getOptions().storage.getItem('test');
        }).not.toThrow();
    });
});

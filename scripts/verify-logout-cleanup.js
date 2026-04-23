#!/usr/bin/env node

/**
 * Logout Data Cleanup Verification Script
 * 
 * This script helps verify that logout properly clears all user data.
 * Run this in the browser console after logout to check what data remains.
 * 
 * Usage:
 * 1. Login to the app
 * 2. Add items to cart and wishlist
 * 3. Open browser DevTools → Console
 * 4. Copy and paste this script
 * 5. Logout from the app
 * 6. Run the script again to verify cleanup
 */

console.log('🔍 Starting Logout Data Cleanup Verification...\n');

// Check localStorage
console.group('📦 LocalStorage Check');
const localStorageKeys = Object.keys(localStorage);
console.log(`Total keys: ${localStorageKeys.length}`);

const userDataKeys = localStorageKeys.filter(key => 
  key.includes('user') || 
  key.includes('auth') || 
  key.includes('cart') || 
  key.includes('wishlist') ||
  key.includes('token')
);

if (userDataKeys.length > 0) {
  console.warn('⚠️ Found user data in localStorage:');
  userDataKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  - ${key}:`, value?.substring(0, 100) + (value?.length > 100 ? '...' : ''));
  });
} else {
  console.log('✅ No user data found in localStorage');
}
console.groupEnd();

// Check sessionStorage
console.group('📦 SessionStorage Check');
const sessionStorageKeys = Object.keys(sessionStorage);
console.log(`Total keys: ${sessionStorageKeys.length}`);

const sessionUserDataKeys = sessionStorageKeys.filter(key => 
  key.includes('user') || 
  key.includes('auth') || 
  key.includes('cart') || 
  key.includes('wishlist') ||
  key.includes('token')
);

if (sessionUserDataKeys.length > 0) {
  console.warn('⚠️ Found user data in sessionStorage:');
  sessionUserDataKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    console.log(`  - ${key}:`, value?.substring(0, 100) + (value?.length > 100 ? '...' : ''));
  });
} else {
  console.log('✅ No user data found in sessionStorage');
}
console.groupEnd();

// Check IndexedDB (if available)
console.group('🗄️ IndexedDB Check');
if (window.indexedDB) {
  indexedDB.databases().then(databases => {
    console.log(`Total databases: ${databases.length}`);
    databases.forEach(db => {
      console.log(`  - ${db.name} (version: ${db.version})`);
    });
  }).catch(err => {
    console.log('⚠️ Could not access IndexedDB:', err.message);
  });
} else {
  console.log('ℹ️ IndexedDB not available');
}
console.groupEnd();

// Check for Zustand stores
console.group('🔄 Zustand Store Check');
const zustandKeys = localStorageKeys.filter(key => 
  key.includes('wishlist') ||
  key.includes('cart') ||
  key.includes('auth-store') ||
  key.includes('preferences')
);

if (zustandKeys.length > 0) {
  console.log('Found Zustand persisted stores:');
  zustandKeys.forEach(key => {
    const value = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(value);
      console.log(`  - ${key}:`, parsed);
    } catch (e) {
      console.log(`  - ${key}:`, value?.substring(0, 100));
    }
  });
} else {
  console.log('ℹ️ No Zustand stores found');
}
console.groupEnd();

// Summary
console.group('📊 Summary');
const totalUserKeys = userDataKeys.length + sessionUserDataKeys.length;
if (totalUserKeys === 0) {
  console.log('✅ PASSED: All user data cleared successfully!');
} else {
  console.warn(`⚠️ FAILED: Found ${totalUserKeys} user data keys remaining`);
  console.log('Please check the items listed above.');
}
console.groupEnd();

// Export function for programmatic use
window.verifyLogoutCleanup = () => {
  return {
    localStorage: userDataKeys,
    sessionStorage: sessionUserDataKeys,
    zustand: zustandKeys,
    isPassed: totalUserKeys === 0
  };
};

console.log('\n💡 Tip: Run window.verifyLogoutCleanup() to get results as object');


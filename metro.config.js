const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("cjs");
config.resolver.sourceExts.push("mjs");
config.resolver.unstable_enablePackageExports = false;

// Platform-specific module resolution for web
config.resolver.resolverMainFields = ["react-native", "browser", "main"];
config.resolver.platforms = ["ios", "android", "native", "web"];

// Remove any problematic aliases that might interfere with platform resolution
config.resolver.alias = {};

module.exports = withNativeWind(config, { input: "./global.css" });
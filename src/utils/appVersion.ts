import DeviceInfo from 'react-native-device-info';

/**
 * Get the current app version and build number
 * @returns Object containing version and buildNumber
 */
export const getAppVersionInfo = () => {
  try {
    return {
      version: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
    };
  } catch (error) {
    console.warn('Failed to get app version info:', error);
    // Fallback values from package.json and app.json
    return {
      version: '1.0.0',
      buildNumber: '1',
    };
  }
};

/**
 * Get just the app version
 * @returns App version string
 */
export const getAppVersion = (): string => {
  return getAppVersionInfo().version;
};

/**
 * Get just the build number
 * @returns Build number string
 */
export const getBuildNumber = (): string => {
  return getAppVersionInfo().buildNumber;
};

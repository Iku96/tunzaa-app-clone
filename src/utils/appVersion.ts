/**
 * Stubbed App Version Info to prevent crashes when native modules are missing.
 */
export const getAppVersionInfo = () => {
  return {
    version: '2.0.0',
    buildNumber: '1',
  };
};

export const getAppVersion = (): string => {
  return '2.0.0';
};

export const getBuildNumber = (): string => {
  return '1';
};

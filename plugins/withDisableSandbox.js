const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to disable User Script Sandboxing in Xcode.
 * This resolves the "Sandbox: bash deny" error in Xcode 15+.
 */
const withDisableSandbox = (config) => {
    return withXcodeProject(config, (config) => {
        const xcodeProject = config.modResults;
        const configurations = xcodeProject.pbxXCBuildConfigurationSection();

        for (const key in configurations) {
            const configuration = configurations[key];
            if (configuration && configuration.buildSettings) {
                // Set ENABLE_USER_SCRIPT_SANDBOXING to NO
                configuration.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = '"NO"';
                // Ensure dSYM format is set for all configurations to resolve symbol upload issues
                configuration.buildSettings.DEBUG_INFORMATION_FORMAT = '"dwarf-with-dsym"';
                // Prevent symbol stripping which can cause missing dSYMs for frameworks like Hermes
                configuration.buildSettings.STRIP_INSTALLED_PRODUCT = '"NO"';
                configuration.buildSettings.COPY_PHASE_STRIP = '"NO"';
            }
        }

        return config;
    });
};

module.exports = withDisableSandbox;

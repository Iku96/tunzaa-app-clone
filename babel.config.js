module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["."],
                    alias: {
                        "@": ["./src", "."],
                        "react-native-maps": "@teovilla/react-native-web-maps",
                    },
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};

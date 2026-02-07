/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                'brand-primary': '#2D3E66',
                'brand-accent': '#425BA4',
                'brand-green': '#22C55E',
                'brand-text': '#1F2937',
                'brand-muted': '#6B7280',
            },
            fontFamily: {
                'sans': ['System', 'sans-serif'],
            },
        },
    },
    plugins: [],
}


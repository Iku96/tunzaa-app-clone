const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // Legacy theme colors (for backward compatibility)
        "theme-primary": "rgb(var(--color-primary) / <alpha-value>)",
        "theme-secondary": "rgb(var(--color-secondary) / <alpha-value>)",
        "theme-accent": "rgb(var(--color-accent) / <alpha-value>)",
        "theme-text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "theme-text-secondary":
          "rgb(var(--color-text-secondary) / <alpha-value>)",
        "theme-background-primary":
          "rgb(var(--color-background-primary) / <alpha-value>)",
        "theme-background-secondary":
          "rgb(var(--color-background-secondary) / <alpha-value>)",
        "theme-border": "rgb(var(--color-border) / <alpha-value>)",

        // New adaptive system colors
        "system-background": "rgb(var(--color-background-primary) / <alpha-value>)",
        "system-background-secondary": "rgb(var(--color-background-secondary) / <alpha-value>)",
        "system-background-tertiary": "rgb(var(--color-background-tertiary) / <alpha-value>)",
        "system-background-elevated": "rgb(var(--color-background-elevated) / <alpha-value>)",
        "system-text": "rgb(var(--color-text-primary) / <alpha-value>)",
        "system-text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "system-text-tertiary": "rgb(var(--color-text-tertiary) / <alpha-value>)",
        "system-text-disabled": "rgb(var(--color-text-disabled) / <alpha-value>)",
        "system-border": "rgb(var(--color-border-primary) / <alpha-value>)",
        "system-border-secondary": "rgb(var(--color-border-secondary) / <alpha-value>)",
        "system-border-focus": "rgb(var(--color-border-focus) / <alpha-value>)",
        "system-surface": "rgb(var(--color-surface-default) / <alpha-value>)",
        "system-surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
        "system-surface-sunken": "rgb(var(--color-surface-sunken) / <alpha-value>)",

        // Brand colors (tenant-specific)
        "brand-primary": "rgb(var(--color-brand-primary) / <alpha-value>)",
        "brand-secondary": "rgb(var(--color-brand-secondary) / <alpha-value>)",
        "brand-accent": "rgb(var(--color-brand-accent) / <alpha-value>)",
      },
      fontSize: {
        xs: ["13px", { lineHeight: "17px" }],
        sm: ["15px", { lineHeight: "21px" }],
        base: ["17px", { lineHeight: "25px" }],
        lg: ["19px", { lineHeight: "29px" }],
        xl: ["21px", { lineHeight: "33px" }],
        "2xl": ["25px", { lineHeight: "37px" }],
      },
      fontFamily: {
        'sans': ['Gilroy-Regular', 'system-ui', '-apple-system', 'sans-serif'],
        'lato': ['var(--font-family-lato)', 'Lato', 'system-ui', '-apple-system', 'sans-serif'],
        'gilroy': ['Gilroy-Regular', 'system-ui', '-apple-system', 'sans-serif'],
        'gilroy-medium': ['Gilroy-Medium', 'system-ui', '-apple-system', 'sans-serif'],
        'gilroy-semibold': ['Gilroy-SemiBold', 'system-ui', '-apple-system', 'sans-serif'],
        'gilroy-bold': ['Gilroy-Bold', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

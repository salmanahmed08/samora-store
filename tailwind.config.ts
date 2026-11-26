import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Editorial Luxury Boutique Palette (No generic Black & White)
        alabaster: "#F5F1EA", // Main Page Background (Warm Alabaster / Bone)
        sandstone: "#EBE4D8", // Secondary sections & feature frames
        linen: "#FAF8F4",     // Crisp warm elevated cards & inputs
        espresso: "#1F1A17",  // Primary deep contrast text & dark elements
        taupe: "#6B5E54",     // Muted secondary text
        olive: {
          DEFAULT: "#2C3A2F", // Primary brand accent (Deep Forest Olive)
          hover: "#222D24",
          light: "#3E5042",
          surface: "rgba(44, 58, 47, 0.08)",
        },
        terracotta: {
          DEFAULT: "#B55A38", // Secondary highlight / warm accent
          hover: "#9C4A2B",
          light: "#CD6F4B",
          surface: "rgba(181, 90, 56, 0.09)",
        },
        warmBorder: "rgba(31, 26, 23, 0.10)",
        warmBorderLight: "rgba(31, 26, 23, 0.06)",
        warmBorderStrong: "rgba(31, 26, 23, 0.18)",

        // Retain legacy references for backward compatibility with isolated admin
        obsidian: {
          DEFAULT: "#F5F1EA",
          950: "#FAF8F4",
          900: "#F5F1EA",
          850: "#EBE4D8",
          800: "#E5DDD0",
          700: "#D6CCC0",
          600: "#6B5E54",
          500: "#1F1A17",
        },
        metallic: {
          border: "rgba(31, 26, 23, 0.10)",
          borderLight: "rgba(31, 26, 23, 0.06)",
          silver: "#6B5E54",
          platinum: "#EBE4D8",
          highlight: "#FAF8F4",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "var(--font-cormorant)", "Georgia", "serif"],
        heading: ["var(--font-fraunces)", "var(--font-cormorant)", "Georgia", "serif"],
        editorial: ["var(--font-cormorant)", "var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "-apple-system", "sans-serif"],
        mono: ["var(--font-jakarta)", "sans-serif"], // Zero monospace on storefront
      },
      letterSpacing: {
        normalBrand: "-0.01em",
        tightBrand: "-0.02em",
        wideBrand: "0.06em",
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        pulseSubtle: "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

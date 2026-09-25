/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
    fontSize: {
      xs: ["0.875rem", { lineHeight: "1.25rem" }],   // 14px
      sm: ["1rem", { lineHeight: "1.5rem" }],        // 16px
      base: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
      lg: ["1.25rem", { lineHeight: "1.75rem" }],    // 20px
      xl: ["1.5rem", { lineHeight: "2rem" }],        // 24px
      "2xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "3xl": ["2.25rem", { lineHeight: "2.5rem" }],  // 36px
      "4xl": ["2.75rem", { lineHeight: "1" }],       // 44px
      "5xl": ["3.5rem", { lineHeight: "1" }],        // 56px
    },
  },
  plugins: [],
};

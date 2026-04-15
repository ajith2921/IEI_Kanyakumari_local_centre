/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#dbeeff",
          200: "#b9ddff",
          300: "#86c5ff",
          400: "#4da6ff",
          500: "#1b82f0",
          600: "#1268cf",
          700: "#1053a8",
          800: "#114989",
          900: "#153f70"
        }
      },
      fontFamily: {
        heading: ["Merriweather", "serif"],
        body: ["Nunito Sans", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 25px -12px rgba(16, 83, 168, 0.35)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

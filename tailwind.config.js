/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#030712",
          card: "#111827",
          primary: "#6366f1",
          secondary: "#a855f7",
          accent: "#22d3ee",
          success: "#10b981",
          error: "#f43f5e"
        }
      },
      backgroundImage: {
        'cyber-gradient': "radial-gradient(circle at top center, #1e1b4b 0%, #030712 100%)",
      }
    },
  },
  plugins: [],
}

  /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#1A1A2E',
        'vibrant-cyan': '#00C4B4',
        'cool-gray': '#E0E0E0',
        'soft-lilac': '#C084FC',
      },
    },
  },
  plugins: [],
};
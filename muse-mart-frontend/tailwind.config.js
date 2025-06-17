// muse-mart-frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Add Inter to the default sans-serif stack
      },
      colors: {
        primary: {
          light: '#60A5FA', // blue-400
          DEFAULT: '#3B82F6', // blue-500
          dark: '#2563EB', // blue-600
        },
        secondary: {
          light: '#A78BFA', // violet-400
          DEFAULT: '#8B5CF6', // violet-500
          dark: '#7C3AED', // violet-600
        },
        accent: {
          DEFAULT: '#F59E0B', // amber-500
        },
        background: '#F9FAFB', // Light gray background
        card: '#FFFFFF', // White for cards
        text: {
          DEFAULT: '#1F2937', // Gray-900 for main text
          light: '#4B5563', // Gray-600 for secondary text
        },
      },
    },
  },
  plugins: [],
}
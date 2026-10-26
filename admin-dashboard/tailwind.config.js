/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'inkloom-dark': '#080C14',
        'inkloom-card': '#0F172A',
        'inkloom-surface': '#1E293B',
        'inkloom-primary': '#4F46E5',
        'inkloom-cyan': '#06B6D4',
        'inkloom-emerald': '#10B981',
        'inkloom-amber': '#F59E0B',
        'inkloom-rose': '#F43F5E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

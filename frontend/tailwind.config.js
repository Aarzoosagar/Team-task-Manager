/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f3f0ff', 100: '#e9e3ff', 200: '#d4c9fe',
          400: '#9f7aea', 500: '#7c3aed', 600: '#6d28d9', 700: '#5b21b6',
        },
      },
    },
  },
  plugins: [],
}

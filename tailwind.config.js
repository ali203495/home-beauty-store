/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{vue,js,ts}",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: '#C5A059',
          cream: '#F9F6F1',
          black: '#1A1A1A',
          muted: '#717171',
          border: '#E5E1DA'
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'luxury': '2px',
      }
    },
  },
  plugins: [],
}

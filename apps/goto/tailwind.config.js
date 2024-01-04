/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#00AA00',
        'primary-hover': '#008800',
      },
      keyframes: {
        bubble: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
        },
      },
      animation: {
        'bubble-1': 'bubble 1s ease-in-out infinite 0s',
        'bubble-2': 'bubble 1s ease-in-out infinite .2s',
        'bubble-3': 'bubble 1s ease-in-out infinite .4s',
      },
    },
  },
  plugins: [],
}

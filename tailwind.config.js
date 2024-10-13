/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bangers: ['Bangers', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow')
  ],
}
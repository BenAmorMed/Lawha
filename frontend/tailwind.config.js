/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D91E63',
          dark: '#C2185B',
          light: '#FF6B9D',
        },
        dark: '#333333',
        secondary: '#F5F5F5',
        star: '#FFB800',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      aspectRatio: {
        '3/4': '3 / 4',
      },
    },
  },
  plugins: [],
}

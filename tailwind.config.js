/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          blue: '#1e3a5f',
          red: '#c41e3a',
          gold: '#c9a84c',
          dark: '#0f1e2d',
        }
      }
    },
  },
  plugins: [],
}

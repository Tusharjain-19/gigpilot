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
        background: '#111318',
        surface: {
          DEFAULT: '#1A1D23',
          dim: '#111318',
          low: '#14161C',
          container: '#1A1D23',
          high: '#282A2F',
        },
        border: {
          DEFAULT: '#272A31',
          subtle: '#1E2128',
        },
        pine: {
          500: '#15803D',
          600: '#166534',
          700: '#14532D',
          light: '#79DB8D'
        },
        terracotta: {
          500: '#C2410C',
          600: '#9A3412',
          light: '#FFB59D'
        },
        stone: {
          100: '#F4F4F5',
          200: '#E4E4E7',
          400: '#A1A1AA',
          500: '#71717A',
          800: '#27272A',
          900: '#18181B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.125rem', // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem', // 6px
        'lg': '0.5rem', // 8px
        'xl': '0.75rem', // 12px
      }
    },
  },
  plugins: [],
}

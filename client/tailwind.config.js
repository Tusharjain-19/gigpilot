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
        app: 'var(--bg-primary)',
        surface: 'var(--surface-card)',
        low: 'var(--surface-low)',
        elevated: 'var(--surface-elevated)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        border: 'var(--border-color)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)'
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
        '2xl': '1rem', // 16px
      }
    },
  },
  plugins: [],
}

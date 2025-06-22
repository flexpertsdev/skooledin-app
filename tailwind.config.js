/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7c3aed',
          darker: '#6d28d9',
          light: '#f3e8ff',
          surface: '#faf5ff'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        destructive: '#dc2626',
        subject: {
          math: '#3b82f6',
          science: '#10b981',
          language: '#f59e0b',
          history: '#a78bfa',
          arts: '#ec4899',
          sports: '#14b8a6'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'touch': '44px',
        'touch-lg': '56px'
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '56px'
      }
    },
  },
  plugins: [],
}
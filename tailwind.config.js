/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cozy personal palette
        sage: {
          50: '#f6f7f6',
          100: '#e1e7e1',
          200: '#c4d1c4',
          300: '#9fb09f',
          400: '#7a8f7a',
          500: '#5d735d',
          600: '#485b48',
          700: '#3a473a',
          800: '#2d372d',
          900: '#252d25',
        },
        coral: {
          50: '#fef7f3',
          100: '#fdeee6',
          200: '#fbd5c2',
          300: '#f7b494',
          400: '#f18a5f',
          500: '#eb6b3d',
          600: '#dc5429',
          700: '#b73f1f',
          800: '#93351d',
          900: '#762f1c',
        },
        cream: {
          50: '#fefdfb',
          100: '#fefbf3',
          200: '#fcf4e3',
          300: '#f8e8c8',
          400: '#f2d7a7',
          500: '#e8bf7a',
          600: '#d4a348',
          700: '#b8853a',
          800: '#956a30',
          900: '#7a5729',
        },
        forest: {
          50: '#f4f6f4',
          100: '#e3e8e3',
          200: '#c8d2c8',
          300: '#a3b3a3',
          400: '#7d917d',
          500: '#5f735f',
          600: '#4a5a4a',
          700: '#3d483d',
          800: '#323a32',
          900: '#2a302a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgb(59 130 246 / 0.5)' },
          '100%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
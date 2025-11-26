/* eslint-disable @typescript-eslint/no-require-imports */
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', 'var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: {
          DEFAULT: 'var(--color-bg)',
          muted: 'var(--color-bg-muted)',
          inverted: 'var(--color-bg-inverse)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          glass: 'var(--color-surface-glass)',
        },
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
        },
        accent: {
          sky: 'var(--color-accent-sky)',
          rose: 'var(--color-accent-rose)',
          mint: 'var(--color-accent-mint)',
          amber: 'var(--color-accent-amber)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': 'var(--shadow-glow)',
        'floating': '0 25px 65px rgba(5, 6, 10, 0.35)',
      },
      spacing: {
        '15': '3.75rem',
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backgroundImage: {
        'grid-radial': 'radial-gradient(circle at 20% 0%, rgba(138, 99, 255, 0.25), transparent 50%), radial-gradient(circle at 85% 10%, rgba(242, 158, 234, 0.18), transparent 55%)',
        'hero-gradient': 'linear-gradient(180deg, #fdf7ff 0%, #f3ebff 50%, #f8f5ff 100%)',
        'hero-overlay': 'radial-gradient(circle at 35% 25%, rgba(111, 71, 255, 0.25), transparent 55%)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

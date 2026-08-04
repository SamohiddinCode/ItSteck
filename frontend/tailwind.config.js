/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F14',
        surface: '#18181F',
        'surface-2': '#1E1E27',
        primary: '#7C3AED',
        'primary-hover': '#8B5CF6',
        'primary-dim': '#7C3AED33',
        text: '#F3F4F6',
        muted: '#A1A1AA',
        border: '#27272A',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 58, 237, 0.15)',
        'glow-sm': '0 0 20px rgba(124, 58, 237, 0.1)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        pulse2: 'pulse2 2s cubic-bezier(0.4,0,0.6,1) infinite',
        // Duration is set per-instance from the content length — see PromoTicker.
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulse2: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        // Half the track, because the ticker renders its items twice.
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

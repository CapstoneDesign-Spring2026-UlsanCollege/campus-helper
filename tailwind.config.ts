import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Keep names aligned with `next/font` variables in `src/app/layout.tsx`.
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        brand: {
          purple: 'var(--color-brand-purple)',
          indigo: 'var(--color-brand-indigo)',
          accent: 'var(--color-brand-accent)',
          danger: 'var(--color-brand-danger)',
          warning: 'var(--color-brand-warning)',
        },
      },
      keyframes: {
        move: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.9)' },
          '50%': { opacity: '0.8', transform: 'scale(1)' },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
      animation: {
        move: 'move 10s linear infinite',
        pulse: 'pulse 8s ease-in-out infinite',
        typewriter: 'typewriter 3s steps(40) 1s forwards',
      },
    },
  },
  plugins: [],
};

export default config;
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#9333EA',
          indigo: '#4F46E5',
          accent: '#00F5FF',
          danger: '#FF006E',
          warning: '#FF9F1C',
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
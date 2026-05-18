import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        poke: {
          red: '#CC0000',
          blue: '#3B5998',
          yellow: '#FFCB05',
          dark: '#0A0A0F',
          card: '#12121A',
          border: '#1E1E2E',
          muted: '#6B6B8A',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        poke: '0 0 20px rgba(255, 203, 5, 0.15)',
        'poke-hover': '0 0 30px rgba(255, 203, 5, 0.3)',
        'poke-red': '0 0 20px rgba(204, 0, 0, 0.3)',
      },
      backgroundImage: {
        'poke-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0F0F1A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config

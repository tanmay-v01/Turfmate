/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          grass: '#34D399', // Emerald 400
          grassLight: '#A7F3D0', // Emerald 200
          grassPale: '#D1FAE5', // Emerald 100
          grassFresh: '#10B981', // Emerald 500
          grassDeep: '#059669', // Emerald 600
          grassInk: '#047857', // Emerald 700
          forest: '#064E3B', // Emerald 900
          forestSoft: '#065F46', // Emerald 800
          background: '#FFFFFF', // White
          surface: '#FFFFFF',
          text: '#064E3B',
          muted: '#4B5563', // Gray 600
          border: '#D1FAE5',
          accent: '#ECFDF5',
          lime: '#34D399',
          // legacy aliases
          primary: '#10B981',
          primaryDark: '#059669',
          forestMid: '#065F46',
          forestLight: '#059669',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px -2px rgba(34, 197, 94, 0.12)',
        card: '0 8px 32px -8px rgba(21, 128, 61, 0.1)',
        premium: '0 24px 48px -12px rgba(21, 128, 61, 0.15)',
        glow: '0 0 48px rgba(134, 239, 172, 0.55)',
        nav: '0 -8px 32px rgba(21, 128, 61, 0.08)',
        pill: '0 4px 14px rgba(74, 222, 128, 0.35)',
      },
      backgroundImage: {
        'grass-mesh': 'radial-gradient(at 40% 20%, #BBF7D0 0px, transparent 50%), radial-gradient(at 80% 0%, #DCFCE7 0px, transparent 50%), radial-gradient(at 0% 50%, #ECFCCB 0px, transparent 50%), radial-gradient(at 80% 50%, #F0FDF4 0px, transparent 50%)',
        'grass-hero': 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 40%, #86EFAC 100%)',
        'grass-btn': 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 50%, #22C55E 100%)',
        'grass-shine': 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-up-slow': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pop': 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'blob': 'blob 9s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '70%': { transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(0deg) scale(1)' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'rotate(8deg) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.97)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ada brand colors
        ada: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#c2d4ff',
          300: '#9cb8ff',
          400: '#7594ff',
          500: '#4d6aff', // Primary Ada blue
          600: '#3b4ecc',
          700: '#324199',
          800: '#2a3466',
          900: '#1f2633',
        },
        // Kitchen station colors
        station: {
          hot: '#FF6B6B',      // Hot kitchen - red
          cold: '#4ECDC4',     // Cold prep - teal  
          grill: '#FFD93D',    // Grill - yellow
          bar: '#6BCF7F',      // Bar - green
        },
        // Priority colors
        priority: {
          low: '#9CA3AF',      // Gray
          normal: '#3B82F6',   // Blue
          high: '#F59E0B',     // Amber
          urgent: '#EF4444',   // Red
        },
        // Modern KDS Status colors  
        status: {
          new: '#10B981',      // Emerald - calm, organized
          preparing: '#F59E0B', // Amber - active, working
          ready: '#EF4444',    // Red - urgent, attention
          completed: '#6B7280', // Gray - finished
          cancelled: '#9CA3AF', // Light gray
        },
        
        // KDS System colors
        kds: {
          bg: '#1a1a1a',       // Deep charcoal background
          surface: '#262626',   // Card surfaces
          border: '#404040',    // Subtle borders
          'text-primary': '#ffffff',    // Primary text
          'text-secondary': '#a3a3a3',  // Secondary text
          'text-muted': '#737373',      // Muted text
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'flash': 'flash 1s ease-in-out',
        'flash-urgent': 'flashUrgent 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
          },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        flash: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(251, 191, 36, 0.2)' },
        },
        flashUrgent: {
          '0%, 100%': { 
            backgroundColor: 'rgb(38, 38, 38)',
            borderLeftColor: 'rgb(239, 68, 68)',
          },
          '50%': { 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeftColor: 'rgb(239, 68, 68)',
          },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(77, 106, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(77, 106, 255, 0.8)' },
        },
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}

export default config
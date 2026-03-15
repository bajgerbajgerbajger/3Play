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
        '3play-dark': '#0f0f23',
        '3play-card': '#1a1a2e',
        '3play-border': '#2a2a4e',
        '3play-accent': '#e94560',
        '3play-accent-hover': '#d63d56',
        '3play-text': '#ffffff',
        '3play-text-secondary': '#aaaaaa',
        '3play-text-muted': '#717171',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      aspectRatio: {
        'video': '16 / 9',
        'thumbnail': '16 / 9',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

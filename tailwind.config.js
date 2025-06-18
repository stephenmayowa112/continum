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
        sans: ['var(--font-montserrat)', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10%)' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 0.8s infinite',
      },
      keyframes: {
        'fade-slide': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-slide': 'fade-slide 1s ease-out forwards',
        'marquee-fast': 'marquee 20s linear infinite',
      },
      keyframes: {
        'fade-slide': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'gradient-spin': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'fade-slide': 'fade-slide 1s ease-out forwards',
        'zoom-in': 'zoom-in 1s ease-out forwards',
        'fade-in': 'fade-in 1.5s ease-out forwards',
        'gradient-spin': 'gradient-spin 4s linear infinite',
      },
      backgroundSize: {
        'gradient-size': '200% 200%',
      },
      keyframes: {
        'float-breathing': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'float-breathing': 'float-breathing 3s ease-in-out infinite',
      },
      keyframes: {
        fadeSlide: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'fade-slide': 'fadeSlide 1s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        wiggle: 'wiggle 0.4s ease-in-out',
      },

    },
  },
  plugins: [],
}
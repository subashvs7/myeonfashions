/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:    '#2D1B69',
          secondary:  '#7C3AED',
          accent:     '#F59E0B',
          bg:         '#FAFAF8',
          text:       '#1C1917',
          success:    '#10B981',
          error:      '#F43F5E',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
      aspectRatio: {
        '3/4': '3 / 4',
      },
    },
  },
  plugins: [],
};

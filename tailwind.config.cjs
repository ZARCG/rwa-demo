/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sal: {
          primary:       '#00bfa5',
          light:         '#40E0D0',
          dark:          '#009688',
          bg:            '#1e1e1e',
          surface:       '#282828',
          card:          '#242424',
          border:        'rgba(0,191,165,0.1)',
          'border-hover':'rgba(0,191,165,0.3)',
          muted:         '#808080',
          text:          '#e0e0e0',
          text2:         '#b0b0b0',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Josefin Sans', 'sans-serif'],
        mono:    ['ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        none:    '0',
        sm:      '2px',
        md:      '4px',
        lg:      '4px',
        xl:      '4px',
        '2xl':   '4px',
        full:    '9999px',
      },
      boxShadow: {
        'glow':    '0 6px 12px rgba(0, 191, 165, 0.1)',
        'glow-md': '0 4px 12px rgba(0, 191, 165, 0.2)',
      },
    },
  },
  plugins: [],
}

import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (defined in src/index.css)
        paper: token('paper'),
        surface: token('surface'),
        sunken: token('sunken'),
        ink: {
          DEFAULT: token('ink'),
          2: token('ink-2'),
          3: token('ink-3'),
        },
        rule: token('rule'),
        accent: {
          DEFAULT: token('accent'),
          strong: token('accent-strong'),
          soft: token('accent-soft'),
        },
        mark: token('mark'),
        signal: {
          DEFAULT: token('signal'),
          soft: token('signal-soft'),
        },
        // Legacy scales, remapped so older components inherit the new look
        primary: {
          50: '#eef1fa',
          100: '#dde3f5',
          200: '#bcc8eb',
          300: '#8fa1da',
          400: '#5f76c4',
          500: '#3b55ab',
          600: '#243c8f',
          700: '#1c3077',
          800: '#16265e',
          900: '#101b45',
        },
        gray: colors.stone,
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
        reading: ['var(--font-reading)', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      maxWidth: {
        page: '76rem',
        measure: '42rem',
      },
      boxShadow: {
        sheet: '0 1px 0 rgb(var(--rule)), 0 12px 32px -12px rgb(24 27 33 / 0.12)',
        lift: '0 1px 2px rgb(24 27 33 / 0.06), 0 8px 24px -8px rgb(24 27 33 / 0.14)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'fade-in': 'fadeIn 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};

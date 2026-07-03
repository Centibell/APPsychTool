/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep-space canvas — the neural-interface backdrop.
        void: {
          900: '#05070d',
          800: '#0a0e1a',
          700: '#111726',
          600: '#1a2233',
        },
        // Glass surfaces (used with opacity + backdrop-blur).
        glass: {
          DEFAULT: 'rgba(18, 24, 40, 0.62)',
          light: 'rgba(30, 41, 66, 0.55)',
        },
        // Primary neural accent.
        neural: {
          50: '#e7fcff',
          100: '#c5f7ff',
          200: '#93efff',
          300: '#54e3fb',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Categorical system colors for brain systems (color-coding).
        sys: {
          frontal: '#6ee7b7',   // executive / motor — mint
          parietal: '#93c5fd',  // somatosensory — sky
          temporal: '#fca5a5',  // auditory / memory — coral
          occipital: '#c4b5fd', // visual — violet
          limbic: '#f0abfc',    // emotion / memory — magenta
          brainstem: '#fcd34d', // arousal / vitals — amber
          cerebellum: '#5eead4',// coordination — teal
          deep: '#fdba74',      // basal ganglia / thalamus — orange
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(34, 211, 238, 0.45)',
        'glow-lg': '0 0 48px -8px rgba(34, 211, 238, 0.35)',
        panel: '0 8px 40px -12px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}

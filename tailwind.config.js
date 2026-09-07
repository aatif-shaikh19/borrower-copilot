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
        lokta: {
          bg: 'var(--bg)',
          bg2: 'var(--bg2)',
          ink: 'var(--ink)',
          muted: 'var(--muted)',
          rule: 'var(--rule)',
          accent: 'var(--accent)',
          'accent-ink': 'var(--accent-ink)',
          'accent-soft': 'var(--accent-soft)',
          warn: 'var(--warn)',
          emerald: '#166534',
          'emerald-soft': '#DCFCE7',
          rose: '#991B1B',
          'rose-soft': '#FEE2E2',
        }
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

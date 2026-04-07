/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'rgb(var(--primary) / <alpha-value>)',
          secondary: 'rgb(var(--secondary) / <alpha-value>)',
          accent: 'rgb(var(--accent) / <alpha-value>)',
          surface: 'rgb(var(--surface) / <alpha-value>)',
          text: 'rgb(var(--text) / <alpha-value>)',
          'text-muted': 'rgb(var(--text-secondary) / <alpha-value>)',
          'bg-1': 'rgb(var(--bg-1) / <alpha-value>)',
          'bg-2': 'rgb(var(--bg-2) / <alpha-value>)',
          'bg-3': 'rgb(var(--bg-3) / <alpha-value>)',
        }
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

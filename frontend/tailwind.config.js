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
                // Modern Theme Colors using CSS Variables
                'modern-bg': 'rgb(var(--modern-bg) / <alpha-value>)',
                'modern-card': 'rgb(var(--modern-card) / <alpha-value>)',
                'modern-text': 'rgb(var(--modern-text) / <alpha-value>)',
                'modern-text-secondary': 'rgb(var(--modern-text-secondary) / <alpha-value>)',
                'modern-purple': 'rgb(var(--modern-purple) / <alpha-value>)',
                'modern-blue': 'rgb(var(--modern-blue) / <alpha-value>)',
                'modern-teal': 'rgb(var(--modern-teal) / <alpha-value>)',
                'modern-green': 'rgb(var(--modern-green) / <alpha-value>)',
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            backgroundImage: {
                'salm-gradient': 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)',
                'salm-gradient-soft': 'linear-gradient(135deg, #d5deef 0%, #f4dce5 100%)',
            },
            colors: {
                'theme-primary': 'var(--color-primary)',
                'theme-secondary': 'var(--color-secondary)',
                // ... keep existing mappings
                // Ed-Circle Theme Colors
                'theme-purple': 'var(--color-primary)', // Redirect old theme color
                'theme-purple-light': '#F4F1FF',
                'theme-purple-dark': 'var(--color-secondary)',
                'theme-orange': '#FF9F43',
                'theme-bg': 'var(--theme-bg)',
                'theme-text': 'var(--theme-text)',
                'theme-gray': '#A0A0A0',

                // Salmverse Palette
                'salm-blue': 'var(--color-primary)',
                'salm-pink': '#db88a4',
                'salm-purple': 'var(--color-secondary)',
                'salm-light-blue': '#d5deef', // Light variant
                'salm-light-pink': '#f4dce5', // Light variant

                // Legacy/Modern mappings
                'modern-bg': 'var(--theme-bg)',
                'modern-card': 'var(--theme-card)',
                'modern-text': 'var(--theme-text)',
                'modern-text-secondary': 'var(--theme-text-secondary)',
                'modern-purple': 'var(--color-secondary)',
                'modern-blue': 'var(--color-primary)',
                'modern-teal': '#cc8eb1',   // Map to Salm Purple
                'modern-green': '#40d4a8ff',
            }
        },
    },
    plugins: [],
}

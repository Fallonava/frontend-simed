/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Apple-inspired colors
                'apple-gray': '#f5f5f7',
                'apple-blue': '#0071e3',
                'apple-dark': '#1d1d1f',
            }
        },
    },
    plugins: [],
}

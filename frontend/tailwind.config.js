/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 900
                surface: "#1e293b",    // Slate 800
                primary: "#6366f1",    // Indigo 500
                secondary: "#ec4899",  // Pink 500
                electric: "#facc15",   // Yellow 400
                success: "#10b981",    // Emerald 500
                danger: "#ef4444",     // Red 500
                border: "#334155",     // Slate 700
            },
        },
    },
    plugins: [],
}

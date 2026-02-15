import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Backgrounds
                background: "var(--background)",
                surface: "var(--surface)",
                overlay: "var(--overlay)",

                // Semantic Foregrounds
                foreground: {
                    primary: "var(--foreground-primary)",
                    secondary: "var(--foreground-secondary)",
                    muted: "var(--foreground-muted)",
                    accent: "var(--foreground-accent)",
                },

                // Semantic Borders
                border: {
                    default: "var(--border-default)",
                    focus: "var(--border-focus)",
                },
            },
        },
    },
    plugins: [],
};

export default config;

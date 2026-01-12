/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
                DEFAULT: "#2563EB",
                hover: "#1D4ED8",
                light: "#3B82F6",
                50: "#EFF6FF",
                100: "#DBEAFE",
                foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))",
            },
            card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))",
            },
            cta: {
                DEFAULT: "#EA580C",  // Darker orange for WCAG AA compliance
                hover: "#C2410C",
            },
            // Design system semantic colors
            "ds-bg": {
                DEFAULT: "#F8FAFC",
                card: "#FFFFFF",
                muted: "#F1F5F9",
            },
            "ds-text": {
                DEFAULT: "#1E293B",
                muted: "#475569",
                light: "#64748B",
            },
            "ds-border": {
                DEFAULT: "#E2E8F0",
                focus: "#2563EB",
            },
        },
        fontFamily: {
            heading: ['Poppins', 'sans-serif'],
            body: ['Open Sans', 'sans-serif'],
        },
        borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
            xl: "1rem",
            "2xl": "1.5rem",
        },
        boxShadow: {
            'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            'paper': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        },
        backdropBlur: {
            'glass': '20px',
        },
        spacing: {
            'xs': '0.25rem',
            'sm-space': '0.5rem',
            'md-space': '1rem',
            'lg-space': '1.5rem',
            'xl-space': '2rem',
            '2xl-space': '3rem',
        },
        transitionDuration: {
            'fast': '150ms',
            'normal': '200ms',
            'slow': '300ms',
        },
        transitionTimingFunction: {
            'ease-out': 'ease-out',
        },
        keyframes: {
            "accordion-down": {
                from: { height: "0" },
                to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
                from: { height: "var(--radix-accordion-content-height)" },
                to: { height: "0" },
            },
        },
        animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }

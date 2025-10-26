import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'aurora': 'aurora 20s ease infinite',
        'grid-move': 'grid-move 10s linear infinite',
        'float-particle': 'float-particle 15s linear infinite',
        'rotate-float': 'rotate-float 20s linear infinite',
        'gradient-rotate': 'gradient-rotate 3s linear infinite',
        'gradient-text': 'gradient-text 3s ease infinite',
        'line-pulse': 'line-pulse 4s ease-in-out infinite',
        'cyber-loading': 'cyber-loading 2s ease infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
        'data-stream': 'data-stream 8s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'aurora': {
          '0%, 100%': { 
            backgroundPosition: '0% 0%, 100% 100%, 50% 50%',
            opacity: '0.8'
          },
          '33%': { 
            backgroundPosition: '100% 0%, 0% 100%, 0% 50%',
            opacity: '1'
          },
          '66%': { 
            backgroundPosition: '50% 100%, 50% 0%, 100% 50%',
            opacity: '0.9'
          },
        },
        'grid-move': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(100px, 100px)' },
        },
        'float-particle': {
          '0%': {
            transform: 'translateY(100vh) translateX(0px) rotate(0deg)',
            opacity: '0',
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': {
            transform: 'translateY(-100px) translateX(100px) rotate(360deg)',
            opacity: '0',
          },
        },
        'rotate-float': {
          '0%': { transform: 'rotate(0deg) translateY(0px)' },
          '50%': { transform: 'rotate(180deg) translateY(-20px)' },
          '100%': { transform: 'rotate(360deg) translateY(0px)' },
        },
        'gradient-rotate': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'gradient-text': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'line-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scaleX(1)' },
          '50%': { opacity: '1', transform: 'scaleX(1.2)' },
        },
        'cyber-loading': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'hologram': {
          '0%, 100%': { opacity: '1', transform: 'translateZ(0)' },
          '50%': { opacity: '0.8', transform: 'translateZ(10px)' },
        },
        'data-stream': {
          '0%': { transform: 'translateY(100vh)', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;

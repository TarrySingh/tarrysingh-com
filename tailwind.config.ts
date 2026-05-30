
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
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
        navy: {
          50: "#E8EDF5",
          100: "#C5CEE0",
          200: "#9DADC9",
          300: "#748CB2",
          400: "#5674A1",
          500: "#385C91",
          600: "#305287",
          700: "#25447A",
          800: "#1B376D",
          900: "#0A1628",
          950: "#060E1A",
        },
        gold: {
          50: "#FBF7EE",
          100: "#F5ECD5",
          200: "#EDDEBA",
          300: "#E4CE9D",
          400: "#DEC288",
          500: "#C9A96E",
          600: "#B89350",
          700: "#9A7740",
          800: "#7D5F33",
          900: "#604828",
        },
        synaptic: {
          bgDeep: "var(--bg-deep)",
          bgMid: "var(--bg-mid)",
          panelDeep: "var(--panel-deep)",
          panelMid: "var(--panel-mid)",
          ink: "var(--ink)",
          inkSoft: "var(--ink-soft)",
          inkCool: "var(--ink-cool)",
          inkDim: "var(--ink-dim)",
          hairline: "var(--hairline)",
          copper: "var(--copper)",
        },
        symphony: {
          bgDeep: "var(--symphony-bg-deep)",
          bgMid: "var(--symphony-bg-mid)",
          violet: "var(--symphony-violet)",
          violetHi: "var(--symphony-violet-hi)",
          violetDp: "var(--symphony-violet-dp)",
          rationale: "var(--symphony-rationale)",
          historical: "var(--symphony-historical)",
          behavioural: "var(--symphony-behavioural)",
          structural: "var(--symphony-structural)",
          amber: "var(--symphony-amber)",
          amberHi: "var(--symphony-amber-hi)",
        },
        memphis: {
          amber: "var(--memphis-amber)",
          amberHi: "var(--memphis-amber-hi)",
          rose: "var(--memphis-rose)",
          teal: "var(--memphis-teal)",
          tealDp: "var(--memphis-teal-dp)",
          ceramic: "var(--memphis-ceramic)",
          ceramicDp: "var(--memphis-ceramic-dp)",
          silicon: "var(--memphis-silicon)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "IBM Plex Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Italiana",
          "Cormorant Garamond",
          "serif",
        ],
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

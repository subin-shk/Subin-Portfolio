/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#050505",
        glass: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.12)",
          faint: "rgba(255,255,255,0.04)",
          line: "rgba(255,255,255,0.15)",
        },
        blue: { DEFAULT: "#4d7cff", soft: "#7fa2ff" },
        cyan: { DEFAULT: "#5fd4e8", soft: "#a5e9f5" },
        violet: { DEFAULT: "#9b7bff", soft: "#c3aeff" },
      },
      letterSpacing: {
        tightest: "-0.055em",
        supertight: "-0.04em",
      },
      transitionTimingFunction: {
        glass: "cubic-bezier(0.22, 1, 0.36, 1)",
        liquid: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};

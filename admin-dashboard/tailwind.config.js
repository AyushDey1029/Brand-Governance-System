/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          app: "var(--bg-app)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
          subtle: "var(--bg-surface-subtle)",
          sidebar: "var(--bg-sidebar)",
          header: "var(--bg-header)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          accent: "var(--accent-border)",
        },
        typography: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          subtle: "var(--accent-subtle)",
          border: "var(--accent-border)",
          text: "var(--accent-text)",
          ring: "var(--accent-ring)",
          contrast: "var(--accent-contrast)",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Space Grotesk'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px var(--accent-ring)",
        "glow-lg": "0 0 50px -10px var(--accent-ring)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-light": "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        tactile: "0 4px 20px -2px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-default)",
        "tactile-hover": "0 10px 30px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--accent-border)",
      },
      animation: {
        "ambient-drift": "ambientDrift 28s ease-in-out infinite alternate",
        "ambient-drift-rev": "ambientDriftRev 34s ease-in-out infinite alternate",
        "ambient-drift-alpha": "ambientDriftAlpha 22s ease-in-out infinite alternate",
        "ambient-drift-beta": "ambientDriftBeta 28s ease-in-out infinite alternate",
        "ambient-drift-gamma": "ambientDriftGamma 24s ease-in-out infinite alternate",
        "ambient-drift-core": "ambientDriftCore 32s ease-in-out infinite alternate",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer-light": "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        ambientDrift: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(8%, 12%) scale(1.15)" },
          "100%": { transform: "translate(-6%, 6%) scale(0.95)" },
        },
        ambientDriftRev: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(-10%, -8%) scale(1.1)" },
          "100%": { transform: "translate(5%, -4%) scale(1.02)" },
        },
        ambientDriftAlpha: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(5vw, 6vh, 0) scale(1.07)" },
          "66%": { transform: "translate3d(-4vw, 10vh, 0) scale(0.96)" },
          "100%": { transform: "translate3d(2vw, 3vh, 0) scale(1.02)" },
        },
        ambientDriftBeta: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(-7vw, -5vh, 0) scale(1.10)" },
          "66%": { transform: "translate3d(4vw, -8vh, 0) scale(0.98)" },
          "100%": { transform: "translate3d(-3vw, 2vh, 0) scale(1.04)" },
        },
        ambientDriftGamma: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(6vw, -4vh, 0) scale(0.94)" },
          "66%": { transform: "translate3d(-5vw, 5vh, 0) scale(1.06)" },
          "100%": { transform: "translate3d(3vw, -2vh, 0) scale(1)" },
        },
        ambientDriftCore: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-2vw, 3vh, 0) scale(1.08)" },
          "100%": { transform: "translate3d(3vw, -2vh, 0) scale(0.96)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
}

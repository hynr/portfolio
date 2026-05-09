/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        'surface-deep': 'var(--surface-deep)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-mute': 'var(--ink-mute)',
        rule: 'var(--rule)',
        brick: 'var(--brick)',
        'brick-deep': 'var(--brick-deep)',
        'brick-soft': 'var(--brick-soft)',
        pipe: 'var(--pipe)',
        'pipe-deep': 'var(--pipe-deep)',
        'pipe-soft': 'var(--pipe-soft)',
        coin: 'var(--coin)',
        'coin-deep': 'var(--coin-deep)',
        'coin-soft': 'var(--coin-soft)',
        sky: 'var(--sky)',
        'sky-deep': 'var(--sky-deep)',
        'sky-soft': 'var(--sky-soft)',
        // Legacy primary kept so any existing reference doesn't break the build
        primary: {
          500: 'var(--pipe)',
          600: 'var(--pipe-deep)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Editorial scale — 1.25 ratio between steps
        'display': ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'h1': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'h2': ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'h3': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'lede': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-power': 'cubic-bezier(0.85, 0, 0.15, 1)',
      },
    },
  },
  plugins: [],
}

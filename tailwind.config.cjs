module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,vue}'],
  theme: {
    extend: {
      colors: {
        base: '#0b0f14',
        panel: '#111827',
        accent: '#38bdf8',
        danger: '#f87171',
        success: '#4ade80'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.2), 0 8px 24px rgba(2,6,23,0.6)'
      }
    }
  },
  plugins: []
};

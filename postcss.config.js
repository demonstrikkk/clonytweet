// postcss.config.js
export default {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {},
    '@tailwindcss/postcss': {}, // ✅ use this instead of `tailwindcss`
    autoprefixer: {},
  },
};
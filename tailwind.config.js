module.exports = {
  purge: ["./src/**/*.js", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      serif: ["PT Serif", "serif"],
      mono: ["Input Mono", "Menlo", "monospace"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

module.exports = {
  purge: ["./src/**/*.js", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      serif: ["PT Serif", "serif"],
      mono: ["Menlo", "monospace"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

module.exports = {
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.worker\.js$/,
            use: { loader: "worker-loader" },
          },
        ],
      },
    },
  },
};

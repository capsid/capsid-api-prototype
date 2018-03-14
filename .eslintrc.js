module.exports = {
  parser: "babel-eslint",
  env: {
    node: true,
    es6: true
  },
  extends: ["eslint:recommended", "google", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "off"
  }
};

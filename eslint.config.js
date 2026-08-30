const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ["dist/**", "coverage/**"],
    rules: {
      "import/namespace": "off",
      "import/no-duplicates": "off",
      "import/no-unresolved": "off",
      "no-duplicate-imports": "error",
    },
  },
]);

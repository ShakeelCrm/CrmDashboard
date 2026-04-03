// ESLint configuration for Next.js project
// Minimal configuration to avoid version conflicts
import tsParser from "@typescript-eslint/parser";
import { type } from "os";

export default [
  {
    type:"module",
    // Ignore Next.js build files and node_modules
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      ".turbo/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
    ],
  },
  {
    // TypeScript and JavaScript files configuration
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: 2020,
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        // Node globals
        process: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // React globals (for JSX without import)
        React: "readonly",
        JSX: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // General rules
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["warn", "always"],
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

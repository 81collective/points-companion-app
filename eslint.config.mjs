import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Relax some rules for test files (unit, integration, API route smoke tests)
  {
    files: [
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "src/test/**/*.{ts,tsx,js,jsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Exclude generated and non-source folders from linting
  {
    ignores: [
      "coverage/**",
      "supabase/migrations/**",
      "playwright-tests/**",
    ],
  },
];

export default eslintConfig;

import js from "@eslint/js";
import globals from "globals";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ["**/*.ts"],
    plugins: {
      typescript: typescriptPlugin,
      vitest,
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      }
    },
    rules: {
      "no-useless-constructor": "off",
      ...typescriptPlugin.configs.recommended.rules,
      ...vitest.configs.recommended.rules,
      "vitest/max-nested-describe": ["error", { "max": 3 }],
      // Regras de estilo comuns
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
    }
  }
]);

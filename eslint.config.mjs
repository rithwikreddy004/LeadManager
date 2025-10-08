import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});
<<<<<<< HEAD
=======

>>>>>>> cce44fac7ab735923bf2b06cf6c6ce25d818659e
/*
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];*/

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
    rules: {
<<<<<<< HEAD
      "@typescript-eslint/no-explicit-any": "off", // 👈 disable the rule
      "@typescript-eslint/no-unused-vars": "warn", // 👈 optional: turn unused vars into warnings
=======
      "@typescript-eslint/no-explicit-any": "off", 
      "@typescript-eslint/no-unused-vars": "warn", 
>>>>>>> cce44fac7ab735923bf2b06cf6c6ce25d818659e
    },
  },
];

export default eslintConfig;

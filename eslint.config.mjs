import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15.x still ships its presets as CommonJS objects
// (`module.exports = { extends: [...] }`), which can't be spread into a
// flat config. FlatCompat is the official migration shim that converts
// the legacy-style "extends" preset into a flat array.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Override eslint-config-next's default ignores with the same set,
    // explicit for clarity.
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;

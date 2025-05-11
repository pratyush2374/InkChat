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
    {
        rules: {
            // Disable TypeScript errors
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",

            // Disable React errors
            "react/no-unescaped-entities": "off",
            "react-hooks/exhaustive-deps": "off",

            // Disable code style errors
            "prefer-const": "off",
            "no-var": "off",
        },
    },
];

export default eslintConfig;

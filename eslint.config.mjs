import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

const eslintConfig = defineConfig([...nextVitals, ...nextTs, {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
        parserOptions: {
            projectService: true,
        },
    },
    plugins: {
        "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-empty-interface": "off",
        "no-relative-import-paths/no-relative-import-paths": [
            "error",
            { allowSameFolder: false, prefix: "@", rootDir: "src" },
        ],
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-duplicate-enum-values": "off",
        "react-hooks/use-memo": "off",
        "react-hooks/set-state-in-effect": "off",
        "react-hooks/purity": "off",
        "react-hooks/preserve-manual-memoization": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-empty-object-type": "off",
    },
}, globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**", "*.config.ts", "*.d.ts"]), {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}]);

export default eslintConfig;

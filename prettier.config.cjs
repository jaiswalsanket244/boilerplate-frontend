/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
	plugins: [
		require.resolve("@trivago/prettier-plugin-sort-imports"),
		require.resolve("prettier-plugin-tailwindcss"),
	],

	importOrder: [
		"<BUILTIN_MODULES>",
		"<THIRD_PARTY_MODULES>",
		"<SEPARATOR>",
		"^(@/|@account/|@common/|@public/)",
		"<SEPARATOR>",
		"^[./]",
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrderSideEffects: false,

	tailwindStylesheet: "./src/styles/globals.css",
	tailwindFunctions: ["cn", "clsx", "cva"],
	tailwindAttributes: ["/.*ClassName/"],

	endOfLine: "lf",
	semi: true,
	singleQuote: false,
	tabWidth: 2,
	trailingComma: "es5",
	printWidth: 120,
	arrowParens: "always",
	useTabs: true,
	bracketSpacing: true,
};

module.exports = config;
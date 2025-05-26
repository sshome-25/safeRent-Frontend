module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: ['eslint:recommended', 'plugin:vue/vue3-recommended'],
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
	},
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	plugins: ['vue'],
	rules: {
		'no-unused-vars': 'off',
		'vue/multi-word-component-names': 'off',
		'vue/singleline-html-element-content-newline': 'off',
		'vue/multiline-html-element-content-newline': 'off',
		'vue/max-attributes-per-line': 'off',
		'vue/html-indent': 'off',
		'vue/attributes-order': 'off',
		'vue/html-self-closing': 'off',
		'vue/order-in-components': 'off',
		'vue/html-closing-bracket-newline': 'off',
		'vue/html-closing-bracket-spacing': 'off',
		'vue/first-attribute-linebreak': 'off',
	},
}

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import eslint from 'vite-plugin-eslint'

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [
		vue(),
		eslint({
			include: ['src/**/*.js', 'src/**/*.vue'],
			exclude: ['node_modules'],
			cache: false,
		}),
	],
})

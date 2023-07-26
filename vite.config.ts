import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [
		checker({ typescript: true }),
		tsconfigPaths(),
	],
	assetsInclude: ['**/*.env'],
	base: '/car-billiards/',
});

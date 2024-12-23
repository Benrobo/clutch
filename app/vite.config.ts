import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// @ts-ignore
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	}
});

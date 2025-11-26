import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true,
		},
		alias: {
			$components: 'src/components',
			$server: 'src/lib/server',
			$services: 'src/lib/services',
			$lib: 'src/lib',
			$jobs: 'worker/jobs',
			$styles: 'src/styles',
			$libApi: 'src/lib/api',
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;

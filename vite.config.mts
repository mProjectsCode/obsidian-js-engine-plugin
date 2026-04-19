import { UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import banner from 'vite-plugin-banner';
import path from 'path';
import { builtinModules } from 'node:module';
import { dtsBundlePlugin, getBuildBanner } from 'lemons-obsidian-plugin-helpers/repo-automation';
import manifest from './manifest.json' with { type: 'json' };

const entryFile = 'packages/jsEngine/src/main.ts';

export default defineConfig(async ({ mode }) => {
	const { resolve } = path;
	const prod = mode === 'production';
	const outDir = prod ? 'dist/' : `exampleVault/.obsidian/plugins/${manifest.id}/`;

	let plugins = [
		svelte(),
		banner({
			outDir: outDir,
			content: getBuildBanner(prod ? 'Release Build' : 'Dev Build', version => version),
		}),
		viteStaticCopy({
			targets: [
				{
					src: 'manifest.json',
					dest: outDir,
				},
			],
		}),
		prod ? dtsBundlePlugin({
			sourceDir: 'packages/jsEngine/src',
			tempDir: 'types',
			outputFile: 'JsEngine.d.ts',
			modulePrefix: 'jsEngine/src',
		}) : undefined,
	];

	return {
		plugins: plugins,
		resolve: {
			alias: {
				packages: path.resolve(__dirname, './packages'),
			},
		},
		build: {
			lib: {
				entry: resolve(__dirname, entryFile),
				name: 'main',
				fileName: () => 'main.js',
				formats: ['cjs'],
			},
			minify: prod,
			target: 'es2022',
			sourcemap: prod ? false : 'inline',
			cssCodeSplit: false,
			emptyOutDir: false,
			outDir: '',
			rolldownOptions: {
				input: {
					main: resolve(__dirname, entryFile),
				},
				output: {
					dir: outDir,
					entryFileNames: 'main.js',
					assetFileNames: 'styles.css',
				},
				external: [
					'obsidian',
					'electron',
					'@codemirror/autocomplete',
					'@codemirror/collab',
					'@codemirror/commands',
					'@codemirror/language',
					'@codemirror/lint',
					'@codemirror/search',
					'@codemirror/state',
					'@codemirror/view',
					'@lezer/common',
					'@lezer/highlight',
					'@lezer/lr',
					...builtinModules,
				],
			},
		},
	} as UserConfig;
});

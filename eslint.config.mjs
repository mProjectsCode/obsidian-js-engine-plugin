import { fileURLToPath } from 'node:url';
import { createCIConfig } from '@lemons_dev/eslint-config-obsidian';
import svelteConfig from './svelte.config.mjs';

export default createCIConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	host: ['packages/jsEngine/src/**'],
	workers: [],
	svelteConfig,
});

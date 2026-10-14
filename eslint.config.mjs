import { fileURLToPath } from 'node:url';
import { createCIConfig } from '@lemons_dev/eslint-config-obsidian';
import svelteConfig from './svelte.config.mjs';

export default createCIConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	// Test execution and type checking remain enabled; lint covers implementation and tools.
	ignores: [
		'**/*.test.*',
		'**/*.tests.*',
		'**/*.spec.*',
		'**/*.specs.*',
		'**/test/**',
		'**/tests/**',
		'**/__tests__/**',
		'**/mocks/**',
		'**/__mocks__/**',
		'**/testUtils**',
		'**/e2e-tests/**',
	],
	host: ['packages/jsEngine/src/**'],
	workers: [],
	svelteConfig,
});

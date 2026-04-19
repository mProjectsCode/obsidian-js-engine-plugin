// eslint-disable-next-line @typescript-eslint/no-unused-vars -- type-only import
import * as CodeMirror from 'codemirror';
import type { Plugin, PluginManifest } from 'obsidian';

declare module 'obsidian' {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
			manifests: Record<string, PluginManifest>;
			plugins: Record<string, Plugin>;
			getPlugin: (plugin: string) => Plugin;
		};
	}

	interface MenuItem {
		setWarning(warn: boolean): void;
	}
}

export {};

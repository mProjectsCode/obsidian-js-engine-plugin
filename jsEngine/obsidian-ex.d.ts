import type { Plugin, PluginManifest } from 'obsidian';

declare module 'obsidian' {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
			manifests: Record<string, PluginManifest>;
			plugins: Record<string, Plugin>;
			getPlugin: (plugin: string) => Plugin;
		};

		/**
		 * Open a file or folder with the systems default app for it.
		 * @param path a normalized path to open
		 */
		openWithDefaultApp(path: string): void;
	}

	interface MenuItem {
		setWarning(warn: boolean): void;
	}
}

export {};

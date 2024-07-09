import { MarkdownAPI } from 'jsEngine/api/MarkdownAPI';
import { type CachedMetadata, type TFile, type App, type Plugin } from 'obsidian';
import type JsEnginePlugin from 'jsEngine/main';
import { type InstanceId } from 'jsEngine/api/InstanceId';
import { MessageAPI } from 'jsEngine/api/MessageAPI';
import { ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import { LibAPI } from 'jsEngine/api/LibAPI';
import { type JsFunc } from 'jsEngine/engine/JsExecution';
import { InternalAPI } from 'jsEngine/api/Internal';

export class API {
	/**
	 * Reference to the obsidian app.
	 */
	readonly app: App;
	/**
	 * Reference the JS Engine plugin.
	 */
	readonly plugin: JsEnginePlugin;
	readonly instanceId: InstanceId;
	/**
	 * API to interact with markdown.
	 */
	readonly markdown: MarkdownAPI;
	/**
	 * API to interact with the plugins message system.
	 */
	readonly message: MessageAPI;
	/**
	 * API to interact with packaged libraries.
	 */
	readonly lib: LibAPI;
	/**
	 * API to interact with js engines internals.
	 */
	readonly internal: InternalAPI;

	constructor(app: App, plugin: JsEnginePlugin, instanceId: InstanceId) {
		this.app = app;
		this.plugin = plugin;
		this.instanceId = instanceId;

		this.markdown = new MarkdownAPI(this);
		this.message = new MessageAPI(this);
		this.lib = new LibAPI(this);
		this.internal = new InternalAPI(this);
	}

	/**
	 * Loads an ECMAScript module from a vault relative path.
	 *
	 * @param path the vault relative path of the file to import
	 */
	public async importJs(path: string): Promise<unknown> {
		let fullPath = this.app.vault.adapter.getResourcePath(path);
		if (!fullPath.includes('?')) {
			const scriptFile = this.app.metadataCache.getFirstLinkpathDest(path, '');
			if (scriptFile) {
				fullPath += '?' + scriptFile.stat.mtime;
			}
		}
		return import(fullPath);
	}

	/**
	 * Gets a plugin by its id. A plugin id can be found by looking at its manifest.
	 *
	 * @param pluginId the id of the plugin.
	 */
	public getPlugin(pluginId: string): Plugin {
		return this.app.plugins.getPlugin(pluginId);
	}

	/**
	 * Creates a reactive component.
	 * Reactive components are useful for creating dynamic content.
	 *
	 * @param fn the function to rerun. It's return value will be rendered.
	 * @param initialArgs the initial arguments (for the first render) to pass to the function.
	 */
	public reactive(fn: JsFunc, ...initialArgs: unknown[]): ReactiveComponent {
		return new ReactiveComponent(this, fn, initialArgs);
	}

	public queryVault(query: (file: TFile, cache: CachedMetadata | null) => boolean): TFile[] {
		return this.app.vault.getMarkdownFiles().filter(file => query(file, this.app.metadataCache.getFileCache(file)));
	}
}

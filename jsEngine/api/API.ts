import type { InstanceId } from 'jsEngine/api/InstanceId';
import { InternalAPI } from 'jsEngine/api/Internal';
import { LibAPI } from 'jsEngine/api/LibAPI';
import { MarkdownAPI } from 'jsEngine/api/MarkdownAPI';
import { MessageAPI } from 'jsEngine/api/MessageAPI';
import { PromptAPI } from 'jsEngine/api/PromptAPI';
import { QueryAPI } from 'jsEngine/api/QueryAPI';
import { ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import type { JsFunc } from 'jsEngine/engine/JsExecution';
import type JsEnginePlugin from 'jsEngine/main';
import type { App, Plugin } from 'obsidian';

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
	 * API to query your vault with simple javascript functions.
	 */
	readonly query: QueryAPI;
	readonly prompt: PromptAPI;
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
		this.query = new QueryAPI(this);
		this.prompt = new PromptAPI(this);
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
	 * If the plugin is not enabled, this will return undefined.
	 *
	 * @param pluginId the id of the plugin.
	 */
	public getPlugin(pluginId: string): Plugin | undefined {
		return this.app.plugins.getPlugin(pluginId) ?? undefined;
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
}

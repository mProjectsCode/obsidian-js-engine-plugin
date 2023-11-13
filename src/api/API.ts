import { MarkdownAPI } from './MarkdownAPI';
import { type App, type Plugin } from 'obsidian';
import type JsEnginePlugin from '../main';
import { type InstanceId } from './InstanceId';
import { MessageAPI } from './MessageAPI';
import { ReactiveComponent } from './reactive/ReactiveComponent';
import { LibAPI } from './LibAPI';
import { type JsFunc } from '../jsEngine/JsExecution';

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

	constructor(app: App, plugin: JsEnginePlugin, instanceId: InstanceId) {
		this.app = app;
		this.plugin = plugin;
		this.instanceId = instanceId;

		this.markdown = new MarkdownAPI(this);
		this.message = new MessageAPI(this);
		this.lib = new LibAPI(this);
	}

	/**
	 * Loads an ECMAScript module from a vault relative path.
	 *
	 * @param path the vault relative path of the file to import
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async importJs(path: string): Promise<any> {
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

	public reactive(fn: JsFunc, ...initialArgs: unknown[]): ReactiveComponent {
		return new ReactiveComponent(fn, initialArgs);
	}
}

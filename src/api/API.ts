import { MarkdownAPI } from './MarkdownAPI';
import { App, Plugin } from 'obsidian';
import JsEnginePlugin from '../main';
import { InstanceId } from './InstanceId';
import { MessageAPI } from './MessageAPI';

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

	constructor(app: App, plugin: JsEnginePlugin, instanceId: InstanceId) {
		this.app = app;
		this.plugin = plugin;
		this.instanceId = instanceId;

		this.markdown = new MarkdownAPI(this);
		this.message = new MessageAPI(this);
	}

	/**
	 * Loads an ECMAScript module from a vault relative path.
	 *
	 * @param path the vault relative path of the file to import
	 */
	async importJs(path: string): Promise<any> {
		const fullPath = this.app.vault.adapter.getResourcePath(path);
		return import(fullPath);
	}

	/**
	 * Gets a plugin by its id. A plugin id can be found by looking at its manifest.
	 *
	 * @param pluginId the id of the plugin.
	 */
	getPlugin(pluginId: string): Plugin {
		return this.app.plugins.getPlugin(pluginId);
	}
}

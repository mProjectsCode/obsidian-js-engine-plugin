import {MarkdownAPI} from './MarkdownAPI';
import {App, Plugin} from 'obsidian';
import JsEnginePlugin from '../main';
import {MessageManager} from '../messages/MessageManager';

export class API {
	/**
	 * Reference to the obsidian app.
	 */
	private readonly app: App;
	/**
	 * Reference the JS Engine plugin.
	 */
	private readonly plugin: JsEnginePlugin;
	/**
	 * API to interact with markdown.
	 */
	readonly markdown: MarkdownAPI;
	readonly message: MessageManager;


	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.markdown = new MarkdownAPI(app, plugin);
		this.message = new MessageManager(app, plugin);
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

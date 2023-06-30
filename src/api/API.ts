import {MarkdownAPI} from './MarkdownAPI';
import {App, Plugin} from 'obsidian';
import JsEnginePlugin from '../main';

export class API {
	readonly app: App;
	readonly plugin: JsEnginePlugin;
	readonly markdown: MarkdownAPI;


	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.markdown = new MarkdownAPI(app, plugin);
	}

	/**
	 * Allows importing of ECMAScript modules from a vault relative path.
	 *
	 * @param path the vault relative path of the file to import
	 */
	async importJs(path: string): Promise<any> {
		const fullPath = this.app.vault.adapter.getResourcePath(path);
		return import(fullPath);
	}

	getPlugin(pluginId: string): Plugin {
		return this.app.plugins.getPlugin(pluginId);
	}
}

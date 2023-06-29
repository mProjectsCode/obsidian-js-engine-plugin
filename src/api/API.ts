import { MarkdownBuilder } from '../markdownBuilder/MarkdownBuilder';
import { MarkdownString } from './MarkdownAPI';
import { App } from 'obsidian';
import JsEnginePlugin from '../main';

export class API {
	app: App;
	plugin: JsEnginePlugin;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	createMarkdownBuilder(): MarkdownBuilder {
		return new MarkdownBuilder();
	}

	createMarkdown(markdown: string): MarkdownString {
		return new MarkdownString(markdown);
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
}

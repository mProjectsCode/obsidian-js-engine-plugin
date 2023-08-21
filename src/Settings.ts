import { App, PluginSettingTab } from 'obsidian';
import JsEnginePlugin from './main';

export interface JsEnginePluginSettings {}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {};

export class JsEnginePluginSettingTab extends PluginSettingTab {
	plugin: JsEnginePlugin;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		if (!this.plugin.settings) {
			return;
		}

		containerEl.createEl('h2', { text: 'JS Engine Settings' });
		containerEl.createEl('p', { text: 'Currently Empty, but there will be stuff here later.' });
	}
}

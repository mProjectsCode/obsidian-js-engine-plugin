import { App, PluginSettingTab } from 'obsidian';
import JsEnginePlugin from './main';

export interface JsEnginePluginSettings {
	mySetting: string;
}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {
	mySetting: 'default',
};

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

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });
	}
}

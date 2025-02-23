import type JsEnginePlugin from 'jsEngine/main';
import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';

export interface JsEnginePluginSettings {
	startupScripts?: string[];
}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {
	startupScripts: [],
};

export class JsEnginePluginSettingTab extends PluginSettingTab {
	plugin: JsEnginePlugin;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const containerEl = this.containerEl;
		const settings = this.plugin.settings;
		containerEl.empty();

		if (!settings) {
			return;
		}
	}
}

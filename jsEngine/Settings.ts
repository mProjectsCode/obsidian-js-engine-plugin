import { type App, PluginSettingTab } from 'obsidian';
import type JsEnginePlugin from 'jsEngine/main';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsEnginePluginSettings {}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {};

export class JsEnginePluginSettingTab extends PluginSettingTab {
	plugin: JsEnginePlugin;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		if (!this.plugin.settings) {
			return;
		}

		this.containerEl.createEl('p', { text: 'Currently Empty, but there will be stuff here later.' });
	}
}

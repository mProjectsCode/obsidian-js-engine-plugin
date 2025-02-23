import type JsEnginePlugin from 'jsEngine/main';
import { StartupScriptsModal } from 'jsEngine/settings/StartupScriptModal';
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

		// this.containerEl.createEl('p', { text: 'Currently Empty, but there will be stuff here later.' });

		new Setting(containerEl).setName('Startup scripts').addButton(button => {
			button.setButtonText('Manage').onClick(() => {
				new StartupScriptsModal(this.plugin).open();
			});
		});
	}
}

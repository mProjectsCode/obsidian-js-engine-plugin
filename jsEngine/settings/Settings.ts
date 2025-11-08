import type JsEnginePlugin from 'jsEngine/main';
import { StartupScriptsModal } from 'jsEngine/settings/StartupScriptModal';
import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';

export interface JsEnginePluginSettings {
	startupScripts?: string[];
	disableStatusbar?: boolean;
}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {
	startupScripts: [],
	disableStatusbar: false,
};

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

		// this.containerEl.createEl('p', { text: 'Currently Empty, but there will be stuff here later.' });

		new Setting(this.containerEl).setName('Startup scripts').addButton(button => {
			button.setButtonText('Manage').onClick(() => {
				new StartupScriptsModal(this.plugin).open();
			});
		});

		new Setting(this.containerEl)
			.setName('Disable Status Bar Item')
			.setDesc('Disable the status bar item for messages.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.disableStatusbar ?? JS_ENGINE_DEFAULT_SETTINGS.disableStatusbar!);
				toggle.onChange(async value => {
					this.plugin.settings.disableStatusbar = value;
					await this.plugin.saveSettings();

					if (this.plugin.settings.disableStatusbar) {
						this.plugin.messageManager.removeStatusBarItem();
					} else {
						this.plugin.messageManager.initStatusBarItem();
					}
				});
			});
	}
}

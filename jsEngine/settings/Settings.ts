import type JsEnginePlugin from 'jsEngine/main';
import type { App } from 'obsidian';
import { normalizePath, PluginSettingTab, Setting } from 'obsidian';

export interface JsEnginePluginSettings {
	startupScriptsDirectory: string | undefined;
	startupScripts: string[];
}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {
	startupScriptsDirectory: undefined,
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

		new Setting(containerEl)
			.setName('JS snippets (loaded on startup)')
			.setHeading()
			.addExtraButton(el => {
				el.setTooltip('Open snippets folder')
					.setIcon('folder-open')
					.onClick(async () => await this.openStartupScriptsDirectory());
			});

		new Setting(containerEl)
			.setName('Custom JS Snippets Folder')
			.setDesc('The folder to search for JavaScript files to load')
			.addText(el => {
				el.setPlaceholder('Folder')
					.setValue(settings.startupScriptsDirectory ?? '')
					.onChange(async val => {
						settings.startupScriptsDirectory = val ? normalizePath(val) : undefined;
						await this.plugin.saveSettings();
					});
			});
	}

	async openStartupScriptsDirectory(): Promise<void> {
		const vault = this.app.vault;
		const directory = this.plugin.settings.startupScriptsDirectory ?? '/';
		if (!(await vault.adapter.exists(directory))) {
			await vault.createFolder(directory);
		}
		this.app.openWithDefaultApp(directory);
	}
}

import type JsEnginePlugin from 'jsEngine/main';
import type { App } from 'obsidian';
import { normalizePath, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';

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
				el.setTooltip('Reload snippets')
					.setIcon('refresh-cw')
					.onClick(() => this.display());
			})
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

		const startupScriptsDirectory = this.app.vault.getFolderByPath(settings.startupScriptsDirectory ?? '/');
		let startupScripts: TFile[] = [];
		if (startupScriptsDirectory != null) {
			startupScripts = this.listJSfilesInDirectory(startupScriptsDirectory);
		}
		if (startupScripts.length == 0) {
			new Setting(containerEl).setName('No JS snippets found').setDesc(`JS snippets are stored in "vault/${settings.startupScriptsDirectory ?? ''}"`);
		}
		for (const file of startupScripts) {
			new Setting(containerEl)
				.setName(file.basename)
				.setDesc(`Apply JS snippet from "vault/${file.path}"`)
				.addToggle(el => {
					el.setValue(settings.startupScripts.contains(file.path)).onChange(async val => this.toggleStartupScript(file, val));
				});
		}
	}

	async openStartupScriptsDirectory(): Promise<void> {
		const vault = this.app.vault;
		const directory = this.plugin.settings.startupScriptsDirectory ?? '/';
		if (!(await vault.adapter.exists(directory))) {
			await vault.createFolder(directory);
		}
		this.app.openWithDefaultApp(directory);
	}

	listJSfilesInDirectory(directory: TFolder): TFile[] {
		const files = directory.children.filter(el => el instanceof TFile);
		const folders = directory.children.filter(el => el instanceof TFolder);
		return files.filter(f => f.extension == 'js').concat(folders.flatMap(dir => this.listJSfilesInDirectory(dir)));
	}

	async toggleStartupScript(file: TFile, enable: boolean): Promise<void> {
		const settings = this.plugin.settings;
		if (enable) {
			settings.startupScripts.push(file.path);
		} else {
			settings.startupScripts.remove(file.path);
		}
		await this.plugin.saveSettings();
	}
}

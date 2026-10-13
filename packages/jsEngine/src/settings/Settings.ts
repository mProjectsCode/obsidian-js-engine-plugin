import type { App, SettingDefinitionItem } from 'obsidian';
import { PluginSettingTab } from 'obsidian';
import { JSFileSelectModal } from 'packages/jsEngine/src/fileRunner/JSFileSelectModal';
import type JsEnginePlugin from 'packages/jsEngine/src/main';

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

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				type: 'page',
				name: 'Startup scripts',
				desc: 'Manage scripts that run when the plugin starts, in execution order.',
				items: [
					{
						type: 'list',
						heading: 'Scripts',
						emptyState: 'No startup scripts added.',
						addItem: {
							name: 'Add startup script',
							action: () => {
								new JSFileSelectModal(this.plugin, async selected => {
									(this.plugin.settings.startupScripts ??= []).push(selected.path);
									await this.saveStartupScripts();
								}).open();
							},
						},
						onDelete: index => {
							this.plugin.settings.startupScripts?.splice(index, 1);
							void this.saveStartupScripts();
						},
						onReorder: (oldIndex, newIndex) => {
							const scripts = this.plugin.settings.startupScripts ?? [];
							const [script] = scripts.splice(oldIndex, 1);
							scripts.splice(newIndex, 0, script);
							void this.plugin.saveSettings();
						},
						items: (this.plugin.settings.startupScripts ?? []).map(path => ({
							name: path,
							searchable: false,
						})),
					},
				],
			},
			{
				name: 'Disable status bar item',
				desc: 'Disable the status bar item for messages.',
				render: setting => {
					setting.addToggle(toggle => {
						toggle.setValue(this.plugin.settings.disableStatusbar ?? JS_ENGINE_DEFAULT_SETTINGS.disableStatusbar!);
						toggle.onChange(async value => {
							this.plugin.settings.disableStatusbar = value;
							await this.plugin.saveSettings();

							if (value) {
								this.plugin.messageManager.removeStatusBarItem();
							} else {
								this.plugin.messageManager.initStatusBarItem();
							}
						});
					});
				},
			},
		];
	}

	private async saveStartupScripts(): Promise<void> {
		await this.plugin.saveSettings();
		this.update();
	}
}

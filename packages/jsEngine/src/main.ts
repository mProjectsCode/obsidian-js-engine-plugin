import type { JsEngineApi } from '@lemons_dev/obsidian-js-engine-api';
import type { App, PluginManifest } from 'obsidian';
import { Plugin } from 'obsidian';
import { API } from 'packages/jsEngine/src/api/API';
import { InstanceId, InstanceType } from 'packages/jsEngine/src/api/InstanceId';
import { Engine } from 'packages/jsEngine/src/engine/Engine';
import { JSFileSelectModal } from 'packages/jsEngine/src/fileRunner/JSFileSelectModal';
import { JsMDRC } from 'packages/jsEngine/src/JsMDRC';
import { MessageManager } from 'packages/jsEngine/src/messages/MessageManager';
import type { JsEnginePluginSettings } from 'packages/jsEngine/src/settings/Settings';
import { JS_ENGINE_DEFAULT_SETTINGS, JsEnginePluginSettingTab } from 'packages/jsEngine/src/settings/Settings';
import { Validators } from 'packages/jsEngine/src/utils/Validators';

// @ts-expect-error TS6133
import 'packages/jsEngine/src/styles.css';

export default class JsEnginePlugin extends Plugin {
	declare settings: JsEnginePluginSettings;
	messageManager: MessageManager;
	jsEngine: Engine;
	api: API & JsEngineApi;
	validators: Validators;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this.validators = new Validators();
		this.messageManager = new MessageManager(this.app, this);
		this.jsEngine = new Engine(this.app, this);
		this.api = new API(this.app, this, InstanceId.create(InstanceType.PLUGIN));
	}

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new JsEnginePluginSettingTab(this.app, this));

		if (!this.settings.disableStatusbar) {
			this.messageManager.initStatusBarItem();
		}

		this.registerMarkdownCodeBlockProcessor('js-engine', (source, el, ctx) => {
			ctx.addChild(new JsMDRC(el, this, source, false, ctx));
		});

		this.registerMarkdownCodeBlockProcessor('js-engine-debug', (source, el, ctx) => {
			ctx.addChild(new JsMDRC(el, this, source, true, ctx));
		});

		this.addCommand({
			id: 'execute-js-file',
			name: 'Execute JS File',
			callback: () => {
				new JSFileSelectModal(this, async selected => {
					await this.api.internal.executeFileSimple(selected.path);
				}).open();
			},
		});

		this.app.workspace.onLayoutReady(() => {
			void this.api.internal.executeStartupScripts();
		});

		await this.registerCodeMirrorMode();
	}

	onunload(): void {
		this.messageManager.removeStatusBarItem();
	}

	async loadSettings(): Promise<void> {
		const loadedSettings = (await this.loadData()) as JsEnginePluginSettings;
		this.settings = Object.assign({}, JS_ENGINE_DEFAULT_SETTINGS, loadedSettings);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async registerCodeMirrorMode(): Promise<void> {
		window.CodeMirror.defineMode('js-engine', config => window.CodeMirror.getMode(config, 'javascript'));
		window.CodeMirror.defineMode('js-engine-debug', config => window.CodeMirror.getMode(config, 'javascript'));
	}
}

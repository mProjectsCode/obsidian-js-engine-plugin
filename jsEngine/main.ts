import { javascript } from '@codemirror/legacy-modes/mode/javascript';
import { API } from 'jsEngine/api/API';
import { InstanceId, InstanceType } from 'jsEngine/api/InstanceId';
import { Engine } from 'jsEngine/engine/Engine';
import { JSFileSelectModal } from 'jsEngine/fileRunner/JSFileSelectModal';
import { JsMDRC } from 'jsEngine/JsMDRC';
import { MessageManager } from 'jsEngine/messages/MessageManager';
import type { JsEnginePluginSettings } from 'jsEngine/Settings';
import { JS_ENGINE_DEFAULT_SETTINGS } from 'jsEngine/Settings';
import type { App, PluginManifest } from 'obsidian';
import { Plugin } from 'obsidian';

export default class JsEnginePlugin extends Plugin {
	settings: JsEnginePluginSettings | undefined;
	messageManager: MessageManager;
	jsEngine: Engine;
	api: API;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this.messageManager = new MessageManager(this.app, this);
		this.jsEngine = new Engine(this.app, this);
		this.api = new API(this.app, this, InstanceId.create(InstanceType.PLUGIN));
	}

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	async onload(): Promise<void> {
		await this.loadSettings();

		// this.addSettingTab(new JsEnginePluginSettingTab(this.app, this));

		this.messageManager.initStatusBarItem();

		this.registerMarkdownCodeBlockProcessor('js-engine', (source, el, ctx) => {
			ctx.addChild(new JsMDRC(el, this, source, ctx));
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

		await this.registerCodeMirrorMode();
	}

	onunload(): void {}

	async loadSettings(): Promise<void> {
		const loadedSettings = (await this.loadData()) as JsEnginePluginSettings;
		this.settings = Object.assign({}, JS_ENGINE_DEFAULT_SETTINGS, loadedSettings);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	/**
	 * Inspired by https://github.com/SilentVoid13/Templater/blob/487805b5ad1fd7fbc145040ed82b4c41fc2c48e2/src/editor/Editor.ts#L67
	 */
	async registerCodeMirrorMode(): Promise<void> {
		/* eslint-disable */

		window.CodeMirror.defineMode('js-engine', _config => {
			const mbOverlay: CodeMirror.Mode<any> = {
				startState: () => {
					return javascript.startState?.(4);
				},
				blankLine: (state: any) => {
					return javascript.blankLine?.(state, 4);
				},
				copyState: (_state: any) => {
					return javascript.startState?.(4);
				},
				token: (stream: any, state: any) => {
					const js_result = javascript.token?.(stream, state);
					return `line-HyperMD-codeblock ${js_result}`;
				},
			};

			return mbOverlay;
		});
	}
}

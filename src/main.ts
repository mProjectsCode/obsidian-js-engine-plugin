import { type App, Plugin, type PluginManifest } from 'obsidian';
import { JS_ENGINE_DEFAULT_SETTINGS, type JsEnginePluginSettings } from './Settings';
import { type Mode } from 'codemirror';
import { JsMDRC } from './JsMDRC';
import { API } from './api/API';
import { MessageManager } from './messages/MessageManager';
import { InstanceId, InstanceType } from './api/InstanceId';
import { JsEngine } from './jsEngine/JsEngine';

export default class JsEnginePlugin extends Plugin {
	settings: JsEnginePluginSettings | undefined;
	messageManager: MessageManager;
	jsEngine: JsEngine;
	api: API;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this.messageManager = new MessageManager(this.app, this);
		this.jsEngine = new JsEngine(this.app, this);
		this.api = new API(this.app, this, InstanceId.create(InstanceType.PLUGIN));
	}

	async onload(): Promise<void> {
		await this.loadSettings();

		// this.addSettingTab(new JsEnginePluginSettingTab(this.app, this));

		this.messageManager.initStatusBarItem();

		// this.addCommand({
		// 	id: 'test',
		// 	name: 'JS Engine Test Command',
		// 	callback: () => {},
		// });

		this.registerMarkdownCodeBlockProcessor('js-engine', (source, el, ctx) => {
			const mdrc = new JsMDRC(el, this, source, ctx);
			ctx.addChild(mdrc);
		});

		this.app.workspace.onLayoutReady(async () => {
			await this.registerCodeMirrorMode();
		});
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
		const js_mode: Mode<any> = window.CodeMirror.getMode({}, 'javascript');
		if (js_mode == null || js_mode.name === 'null') {
			console.log("Couldn't find js mode, can't enable syntax highlighting.");
			return;
		}

		window.CodeMirror.defineMode('js-engine', config => {
			const mbOverlay: Mode<any> = {
				startState: () => {
					const js_state = window.CodeMirror.startState(js_mode);
					return {
						...js_state,
					};
				},
				blankLine: (state: any) => {
					return null;
				},
				copyState: (state: any) => {
					const js_state = window.CodeMirror.startState(js_mode);
					return {
						...js_state,
					};
				},
				token: (stream: any, state: any) => {
					const js_result = js_mode.token && js_mode.token(stream, state);
					return `line-HyperMD-codeblock ${js_result}`;
				},
			};

			return mbOverlay;
		});
	}
}

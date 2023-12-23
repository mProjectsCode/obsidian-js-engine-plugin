import { type App, Component, Plugin, type PluginManifest } from 'obsidian';
import { JS_ENGINE_DEFAULT_SETTINGS, type JsEnginePluginSettings } from './Settings';
import { type Mode } from 'codemirror';
import { JsMDRC } from './JsMDRC';
import { API } from './api/API';
import { MessageManager } from './messages/MessageManager';
import { InstanceId, InstanceType } from './api/InstanceId';
import { Engine } from './engine/Engine';
import { javascript } from '@codemirror/legacy-modes/mode/javascript';
import { JSFileSelectModal } from './fileRunner/JSFileSelectModal';

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

	async onload(): Promise<void> {
		await this.loadSettings();

		// this.addSettingTab(new JsEnginePluginSettingTab(this.app, this));

		this.messageManager.initStatusBarItem();

		this.registerMarkdownCodeBlockProcessor('js-engine', (source, el, ctx) => {
			const mdrc = new JsMDRC(el, this, source, ctx);
			ctx.addChild(mdrc);
		});

		this.addCommand({
			id: 'execute-js-file',
			name: 'Execute JS File',
			callback: () => {
				new JSFileSelectModal(this, async selected => {
					const component = new Component();
					component.load();
					try {
						await this.api.internal.executeFile(selected.path, {
							component: component,
						});
					} catch (e) {
						console.warn(e);
					} finally {
						component.unload();
					}
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
			const mbOverlay: Mode<any> = {
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

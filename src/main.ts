import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting} from 'obsidian';
import {JS_ENGINE_DEFAULT_SETTINGS, JsEnginePluginSettings, JsEnginePluginSettingTab} from './Settings';
import {Mode} from 'codemirror';
import {ArgumentManager} from './ArgumentManager';
import {JsEngine} from './JsEngine';
import {JsMDRC} from './JsMDRC';
import {API} from './api/API';

export default class JsEnginePlugin extends Plugin {
	settings: JsEnginePluginSettings | undefined;
	jsEngine: JsEngine | undefined;
	api: API | undefined;


	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
	}

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new JsEnginePluginSettingTab(this.app, this));

		this.api = new API();

		this.jsEngine = new JsEngine(this.app, this);

		this.addCommand({
			id: 'test',
			name: 'JS Engine Test Command',
			callback: () => {
			}
		});

		this.registerMarkdownCodeBlockProcessor('js-engine', (source, el, ctx) => {
			const mdrc = new JsMDRC(el, this, source, ctx);
			ctx.addChild(mdrc);
		})

		await this.registerCodeMirrorMode();
	}

	onunload(): void {

	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, JS_ENGINE_DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	/**
	 * Inspired by https://github.com/SilentVoid13/Templater/blob/487805b5ad1fd7fbc145040ed82b4c41fc2c48e2/src/editor/Editor.ts#L67
	 */
	async registerCodeMirrorMode(): Promise<void> {
		const js_mode: Mode<any> = window.CodeMirror.getMode({}, 'javascript');
		if (js_mode == null || js_mode.name === 'null') {
			console.log("Couldn't find js mode, can't enable syntax highlighting.");
			return;
		}

		window.CodeMirror.defineMode('js-engine', config => {
			const mbOverlay: any = {
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
					// const globals = ['app', 'mb', 'dv', 'filePath', 'ctx'];

					// console.log(stream);

					// for (const global of globals) {
					// 	if (stream.match(global)) {
					// 		return 'variable';
					// 	}
					// }

					const js_result = js_mode.token && js_mode.token(stream, state);
					return `line-HyperMD-codeblock ${js_result}`;
				},
			};

			return mbOverlay;
		});
	}
}


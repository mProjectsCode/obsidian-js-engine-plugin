import {App, Component, TFile} from 'obsidian';
import JsEnginePlugin from './main';

export interface ExecutionContext {
	file: TFile;
	line: number;
}

export interface ExecutionArgument {
	key: string;
	value: unknown;
}

export class ArgumentManager {
	public defaultArgs: ExecutionArgument[];
	private readonly app: App;
	private readonly plugin: JsEnginePlugin;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.defaultArgs = [];
		this.app = app;
		this.plugin = plugin;

		this.defaultArgs.push({
			key: 'app',
			value: this.app,
		});

		this.defaultArgs.push({
			key: 'engine',
			value: this.plugin.api,
		});
	}

	constructArgs(context: ExecutionContext, component: Component, container: HTMLElement): ExecutionArgument[] {
		return [
			...this.defaultArgs,
			{
				key: 'context',
				value: context,
			},
			{
				key: 'component',
				value: component,
			},
			{
				key: 'container',
				value: container,
			},
		];
	}
}

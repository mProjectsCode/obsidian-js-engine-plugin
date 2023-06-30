import { ArgumentManager, ExecutionArgument, ExecutionContext } from './ArgumentManager';
import JsEnginePlugin from './main';
import { App } from 'obsidian';

export class JsEngine {
	app: App;
	plugin: JsEnginePlugin;
	argsManager: ArgumentManager;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.argsManager = new ArgumentManager(app, plugin);
	}

	async execute(code: string, args: ExecutionArgument[]): Promise<unknown> {
		if (!code) {
			return;
		}

		const AsyncFunction = async function (): Promise<void> {}.constructor;

		// @ts-ignore
		const func: any = new AsyncFunction(...args.map(x => x.key), code);

		return Promise.resolve(func(...args.map(x => x.value)));
	}
}

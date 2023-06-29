import {ArgumentManager, ExecutionArgument, ExecutionContext} from './ArgumentManager';
import JsEnginePlugin from './main';
import {App} from 'obsidian';

export class JsEngine {
	app: App;
	plugin: JsEnginePlugin;
	argsManager: ArgumentManager;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.argsManager = new ArgumentManager(app, plugin);
	}

	async execute(code: string, context: ExecutionContext): Promise<unknown> {
		if (!code) {
			return;
		}

		const isAsync = code.contains('await');
		const functionConstructor = isAsync ? async function (): Promise<void> {}.constructor : Function;
		const args: ExecutionArgument[] = this.argsManager.constructArgs(context);

		const func: any = functionConstructor(...args.map(x => x.key), code);

		return Promise.resolve(func(...args.map(x => x.value)));
	}
}

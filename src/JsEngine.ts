import { ArgumentManager, ExecutionArgument, ExecutionContext } from './ArgumentManager';
import JsEnginePlugin from './main';
import { App } from 'obsidian';

const AsyncFunction = async function (): Promise<void> {}.constructor;

export class JsExecution {
	uuid: string;
	code: string;
	args: ExecutionArgument[];
	context: ExecutionContext | undefined;
	func: ((...args: any[]) => Promise<unknown>) | undefined;

	constructor(code: string, args: ExecutionArgument[]) {
		this.code = code;
		this.args = args;

		this.context = args.find(x => x.key === "context")?.value as ExecutionContext | undefined;

		this.uuid = self.crypto.randomUUID();
		this.func = undefined;
	}

	buildFunction(): void {
		this.func = AsyncFunction(...this.args.map(x => x.key), this.code);
	}

	async run(): Promise<unknown> {
		if (!this.func) {
			throw new Error("function has not been constructed yet")
		}

		return Promise.resolve(this.func(...this.args.map(x => x.value)))
	}

}

export class JsEngine {
	app: App;
	plugin: JsEnginePlugin;
	argsManager: ArgumentManager;
	activeExecutions: Map<string, JsExecution>;


	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.argsManager = new ArgumentManager(app, plugin);
		this.activeExecutions = new Map<string, JsExecution>();
	}

	async execute(code: string, args: ExecutionArgument[]): Promise<unknown> {
		if (!code) {
			return;
		}

		const execution = new JsExecution(code, args);
		this.activeExecutions.set(execution.uuid, execution);

		execution.buildFunction();
		const result = await execution.run();

		this.activeExecutions.delete(execution.uuid);

		return result;
	}
}

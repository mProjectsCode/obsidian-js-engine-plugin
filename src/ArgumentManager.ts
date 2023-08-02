import { CachedMetadata, TFile } from 'obsidian';

export interface ExecutionContext {
	file: TFile;
	metadata: CachedMetadata | null;
	line: number;
}

export interface ExecutionArgument {
	key: string;
	value: unknown;
}

// export class ArgumentManager {
// 	public defaultArgs: ExecutionArgument[];
// 	private readonly app: App;
// 	private readonly plugin: JsEnginePlugin;
//
// 	constructor(app: App, plugin: JsEnginePlugin) {
// 		this.defaultArgs = [];
// 		this.app = app;
// 		this.plugin = plugin;
//
// 		this.defaultArgs.push();
// 	}
//
// 	constructArgs(context: ExecutionContext, component: Component, container: HTMLElement): ExecutionArgument[] {
// 		return [
// 			...this.defaultArgs,
//
// 		];
// 	}
// }

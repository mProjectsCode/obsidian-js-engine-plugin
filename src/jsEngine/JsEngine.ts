import JsEnginePlugin from '../main';
import { App } from 'obsidian';
import { ExecutionArgument, ExecutionContext } from '../ArgumentManager';
import { JsExecution, JsExecutionParams } from "./JsExecution";
import { ExecutionStatsModal } from './ExecutionStatsModal';

export type EngineExecutionParams = Omit<JsExecutionParams, 'app' | 'plugin'>

export class JsEngine {
	private readonly app: App;
	private readonly plugin: JsEnginePlugin;
	private executionStatsModal: ExecutionStatsModal;

	activeExecutions: Map<string, JsExecution>;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.executionStatsModal = new ExecutionStatsModal(this.app, this.plugin);
		this.activeExecutions = new Map<string, JsExecution>();
	}

	async execute(params: EngineExecutionParams): Promise<JsExecution> {
		const execution = new JsExecution({app: this.app, plugin: this.plugin, ...params});
		this.activeExecutions.set(execution.uuid, execution);

		execution.buildFunction();

		if (!execution.functionBuildError) {
			await execution.runFunction();
		}

		this.activeExecutions.delete(execution.uuid);

		return execution;
	}

	openExecutionStatsModal(jsExecution: JsExecution): void {
		this.executionStatsModal.setExecution(jsExecution);
		this.executionStatsModal.open();
	}
}

import JsEnginePlugin from '../main';
import { App } from 'obsidian';
import { ExecutionArgument, ExecutionContext } from '../ArgumentManager';
import { JsExecution } from './JsExecution';
import { ExecutionStatsModal } from './ExecutionStatsModal';

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

	async execute(code: string, args: ExecutionArgument[], context: ExecutionContext): Promise<JsExecution> {
		const execution = new JsExecution(this.app, this.plugin, code, args, context);
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

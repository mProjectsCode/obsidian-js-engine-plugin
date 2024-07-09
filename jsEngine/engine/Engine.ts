import type JsEnginePlugin from 'jsEngine/main';
import { type App, type Component } from 'obsidian';
import { JsExecution, type JsExecutionContext } from 'jsEngine/engine/JsExecution';
import { ExecutionStatsModal } from 'jsEngine/engine/ExecutionStatsModal';

/**
 * Parameters for the {@link Engine.execute} method.
 */
export interface EngineExecutionParams {
	/**
	 * The JavaScript code to execute.
	 */
	code: string;
	/**
	 * Obsidian Component for lifecycle management.
	 */
	component: Component;
	/**
	 * Optional container element to render results to.
	 */
	container?: HTMLElement | undefined;
	/**
	 * Optional context to provide to the JavaScript code.
	 */
	context?: JsExecutionContext | undefined;
	/**
	 * Optional extra context variables to provide to the JavaScript code.
	 */
	contextOverrides?: Record<string, unknown> | undefined;
}

export class Engine {
	private readonly app: App;
	private readonly plugin: JsEnginePlugin;
	private executionStatsModal: ExecutionStatsModal;

	readonly activeExecutions: Map<string, JsExecution>;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.executionStatsModal = new ExecutionStatsModal(this.app, this.plugin);
		this.activeExecutions = new Map<string, JsExecution>();
	}

	/**
	 * Execute JavaScript code.
	 *
	 * @param params
	 */
	async execute(params: EngineExecutionParams): Promise<JsExecution> {
		const execution = new JsExecution({ app: this.app, plugin: this.plugin, ...params });
		this.activeExecutions.set(execution.uuid, execution);

		execution.buildFunction();

		if (!execution.functionBuildError) {
			await execution.runFunction();
		}

		this.activeExecutions.delete(execution.uuid);

		return execution;
	}

	/**
	 * Open the execution stats modal for a given {@link JsExecution}.
	 *
	 * @param jsExecution
	 */
	openExecutionStatsModal(jsExecution: JsExecution): void {
		this.executionStatsModal.setExecution(jsExecution);
		this.executionStatsModal.open();
	}
}

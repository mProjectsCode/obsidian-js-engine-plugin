import { ExecutionStatsModal } from 'jsEngine/engine/ExecutionStatsModal';
import type { ExecutionContext } from 'jsEngine/engine/JsExecution';
import { JsExecution } from 'jsEngine/engine/JsExecution';
import type JsEnginePlugin from 'jsEngine/main';
import type { App, Component } from 'obsidian';

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
	 * Context about the location the code was executed from.
	 */
	context: ExecutionContext;
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

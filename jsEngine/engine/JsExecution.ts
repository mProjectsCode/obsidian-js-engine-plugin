import { type App, type CachedMetadata, type Component, type TFile } from 'obsidian';
import type JsEnginePlugin from 'jsEngine/main';
import { MessageType, type MessageWrapper } from 'jsEngine/messages/MessageManager';
import { API } from 'jsEngine/api/API';
import { InstanceId, InstanceType } from 'jsEngine/api/InstanceId';
import * as Obsidian from 'obsidian';
import { type EngineExecutionParams } from 'jsEngine/engine/Engine';

/**
 * An async JavaScript function.
 */
export type JsFunc = (...args: unknown[]) => Promise<unknown>;

/**
 * Context provided to a {@link JsExecution}.
 */
export interface JsExecutionContext {
	/**
	 * The file that the execution was triggered from.
	 */
	file: TFile | undefined;
	/**
	 * The metadata of the file that the execution was triggered from.
	 */
	metadata: CachedMetadata | undefined;
	/**
	 * Currently unused.
	 */
	block: Block | undefined;
}

export interface Block {
	from: number;
	to: number;
}

/**
 * Global variables provided to a {@link JsExecution}.
 */
export interface JsExecutionGlobals {
	/**
	 * Reference to the obsidian [app](https://docs.obsidian.md/Reference/TypeScript+API/App) (obsidian API).
	 */
	app: App;
	/**
	 * Reference to this plugins API.
	 */
	engine: API;
	/**
	 * Obsidian [component](https://docs.obsidian.md/Reference/TypeScript+API/Component) for lifecycle management.
	 */
	component: Component;
	/**
	 * The context provided. This can be undefined and extended by other properties.
	 */
	context: (JsExecutionContext | undefined) & Record<string, unknown>;
	/**
	 * The container element that the execution can render to. This can be undefined.
	 */
	container: HTMLElement | undefined;
	/**
	 * The entire obsidian module, e.g. a notice can be constructed like this: `new obsidian.Notice('Hello World')`.
	 */
	obsidian: typeof Obsidian;
}

/**
 * Parameters used to construct a {@link JsExecution}.
 */
export interface JsExecutionParams extends EngineExecutionParams {
	app: App;
	plugin: JsEnginePlugin;
}

/**
 * Models the execution of a JavaScript string.
 */
export class JsExecution {
	readonly app: App;
	readonly plugin: JsEnginePlugin;

	private readonly globals: JsExecutionGlobals;
	private readonly context: (JsExecutionContext | undefined) & Record<string, unknown>;
	private readonly apiInstance: API;
	private messages: MessageWrapper[];
	private func: JsFunc | undefined;

	readonly uuid: string;
	readonly code: string;
	result: unknown;

	functionBuildError: Error | undefined;
	functionRunError: Error | undefined;

	functionBuildTime: number | undefined;
	functionRunTime: number | undefined;

	constructor(params: JsExecutionParams) {
		this.app = params.app;
		this.plugin = params.plugin;

		this.code = params.code;
		this.context = Object.assign({}, params.context, params.contextOverrides);

		this.uuid = self.crypto.randomUUID();
		this.apiInstance = new API(this.app, this.plugin, new InstanceId(InstanceType.JS_EXECUTION, this.uuid));
		this.messages = [];

		this.func = undefined;

		this.globals = {
			app: this.app,
			engine: this.apiInstance,
			context: this.context,
			component: params.component,
			container: params.container,
			obsidian: Obsidian,
		};
	}

	/**
	 * Creates the function from the code provided in the constructor.
	 */
	buildFunction(): void {
		const startTime = performance.now();

		try {
			// this.func = AsyncFunction(...Object.keys(this.globals), this.code) as JsFunc;
			this.func = window.eval(
				`(async function anonymous(${Object.keys(this.globals).join(', ')}) {\n\n${this.code}\n\n})\n //# sourceURL=${encodeURIComponent(
					this.apiInstance.instanceId.toString(),
				)}`,
			) as JsFunc;
		} catch (e) {
			if (e instanceof Error) {
				this.functionBuildError = e;

				this.result = this.plugin.api?.message.createMessage(
					MessageType.ERROR,
					'Failed to parse JS',
					`Failed to parse JS during execution "${this.uuid}"`,
					e.stack,
				);
			}
		}

		this.functionBuildTime = performance.now() - startTime;
	}

	/**
	 * Runs the function created by {@link JsExecution.buildFunction}.
	 */
	async runFunction(): Promise<void> {
		if (this.functionBuildError) {
			throw new Error('can not run function, function construction failed');
		}

		if (!this.func) {
			throw new Error('can not run function, function has not been constructed yet');
		}

		const startTime = performance.now();

		try {
			// eslint-disable-next-line
			this.result = await Promise.resolve(this.func(...Object.values(this.globals)));
		} catch (e) {
			console.warn('failed to execute JS', e);

			if (e instanceof Error) {
				this.functionRunError = e;

				this.result = this.apiInstance.message.createMessage(
					MessageType.ERROR,
					'Failed to execute JS',
					`Failed to execute JS during execution "${this.uuid}"`,
					e.stack,
				);
			}
		}

		this.messages = this.apiInstance.message.getMessagesForInstance();

		this.functionRunTime = performance.now() - startTime;
	}

	/**
	 * Returns true if the function was built and run without errors.
	 */
	isSuccessful(): boolean {
		return !this.functionBuildError && !this.functionRunError;
	}

	/**
	 * Returns the messages generated by the function.
	 */
	getMessages(): MessageWrapper[] {
		return this.messages;
	}

	/**
	 * Opens the execution stats modal for this execution.
	 */
	openStatsModal(): void {
		this.plugin.jsEngine.openExecutionStatsModal(this);
	}
}

import type { App, CachedMetadata, Component, TFile } from 'obsidian';
import type * as Obsidian from 'obsidian';
import { API } from 'packages/jsEngine/src/api/API';
import { InstanceId, InstanceType } from 'packages/jsEngine/src/api/InstanceId';
import type { EngineExecutionParams } from 'packages/jsEngine/src/engine/Engine';
import type JsEnginePlugin from 'packages/jsEngine/src/main';
import type { MessageWrapper } from 'packages/jsEngine/src/messages/MessageManager';
import { MessageType } from 'packages/jsEngine/src/messages/MessageManager';

/**
 * An async JavaScript function.
 */
export type JsFunc = (...args: unknown[]) => Promise<unknown>;

type AsyncFunctionConstructor = new (...args: string[]) => JsFunc;

const AsyncFunction = async function (): Promise<void> {}.constructor as AsyncFunctionConstructor;

export function buildJsFunc(code: string, globalNames: string[], expression: boolean, sourceUrl: string): JsFunc {
	const functionBody = expression ? `return (\n${code}\n);` : code;
	const func: JsFunc = new AsyncFunction(...globalNames, `${functionBody}\n//# sourceURL=${encodeURIComponent(sourceUrl)}`);
	return func;
}

export enum ExecutionSource {
	MarkdownCodeBlock = 'markdown-code-block',
	MarkdownCallingJSFile = 'markdown-calling-js-file',
	MarkdownOther = 'markdown-other',
	JSFile = 'js-file',
	Unknown = 'unknown',
}

export interface MarkdownCodeBlockExecutionContext {
	executionSource: ExecutionSource.MarkdownCodeBlock;
	/**
	 * The file that the code block is in.
	 * Since rendered markdown does not necessarily have an associated file, this can be undefined.
	 */
	file?: TFile;
	/**
	 * The metadata of the file.
	 */
	metadata?: CachedMetadata | undefined;
	/**
	 * Currently unused.
	 */
	block?: Block | undefined;
}

export interface Block {
	from: number;
	to: number;
}

export interface MarkdownCallingJSFileExecutionContext {
	executionSource: ExecutionSource.MarkdownCallingJSFile;
	/**
	 * The markdown file that the JS File is called from.
	 * Since rendered markdown does not necessarily have an associated file, this can be undefined.
	 */
	file?: TFile;
	/**
	 * The metadata of the markdown file.
	 */
	metadata?: CachedMetadata | undefined;
	/**
	 * The JS that is being called.
	 */
	jsFile: TFile;
}

export interface MarkdownOtherExecutionContext {
	executionSource: ExecutionSource.MarkdownOther;
	/**
	 * The file that the markdown is associated with.
	 * Since rendered markdown does not necessarily have an associated file, this can be undefined.
	 */
	file?: TFile;
	/**
	 * The metadata of the file.
	 */
	metadata?: CachedMetadata | undefined;
}

export interface JSFileExecutionContext {
	executionSource: ExecutionSource.JSFile;
	/**
	 * There is no associated markdown file.
	 */
	file: undefined;
	/**
	 * The JS that is being executed.
	 */
	jsFile: TFile;
}

export interface UnknownExecutionContext {
	executionSource: ExecutionSource.Unknown;
	/**
	 * The file that the execution was triggered from.
	 */
	file?: TFile | undefined;
}

/**
 * Context provided to a {@link JsExecution}.
 */
export type ExecutionContext =
	| MarkdownCodeBlockExecutionContext
	| MarkdownCallingJSFileExecutionContext
	| MarkdownOtherExecutionContext
	| JSFileExecutionContext
	| UnknownExecutionContext;

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
	context: ExecutionContext & Record<string, unknown>;
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
 * Interface for constructing {@link JsExecutionGlobals}.
 */
export interface JsExecutionGlobalsConstructionOptions {
	/**
	 * Optional API instance.
	 * If not provided, the one from which the execution globals are constructed is used.
	 */
	engine?: API;
	/**
	 * Obsidian [component](https://docs.obsidian.md/Reference/TypeScript+API/Component) for lifecycle management.
	 */
	component: Component;
	/**
	 * The context provided. This can be undefined and extended by other properties.
	 */
	context: ExecutionContext & Record<string, unknown>;
	/**
	 * The container element that the execution can render to. This can be undefined.
	 */
	container?: HTMLElement | undefined;
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

	private readonly context: (ExecutionContext | undefined) & Record<string, unknown>;
	private readonly apiInstance: API;
	private messages: MessageWrapper[];
	private func: JsFunc | undefined;

	readonly globals: JsExecutionGlobals;
	readonly uuid: string;
	readonly code: string;
	readonly expression: boolean;
	result: unknown;

	functionBuildError: Error | undefined;
	functionRunError: Error | undefined;

	functionBuildTime: number | undefined;
	functionRunTime: number | undefined;

	constructor(params: JsExecutionParams) {
		this.app = params.app;
		this.plugin = params.plugin;

		this.code = params.code;
		this.expression = params.expression ?? false;
		this.context = {
			...params.context,
			...params.contextOverrides,
		};

		this.uuid = self.crypto.randomUUID();
		this.apiInstance = new API(this.app, this.plugin, new InstanceId(InstanceType.JS_EXECUTION, this.uuid, params.context));
		this.messages = [];

		this.func = undefined;

		this.globals = this.apiInstance.internal.createExecutionGlobals({
			component: params.component,
			context: this.context,
			container: params.container,
		});
	}

	/**
	 * Creates the function from the code provided in the constructor.
	 */
	buildFunction(): void {
		const startTime = performance.now();

		try {
			this.func = buildJsFunc(this.code, Object.keys(this.globals), this.expression, this.apiInstance.instanceId.toString());
		} catch (e) {
			console.warn('failed to parse JS', e);

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
			const params = Object.values(this.globals) as unknown[];
			this.result = await Promise.resolve(this.func(...params));
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

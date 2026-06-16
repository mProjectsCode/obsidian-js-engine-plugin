import type { App, CachedMetadata, Component, Plugin, TFile } from 'obsidian';
import type * as Obsidian from 'obsidian';

export const JS_ENGINE_PLUGIN_ID = 'js-engine';

export type JsFunc = (...args: unknown[]) => Promise<unknown>;

export const ExecutionSource = {
	MarkdownCodeBlock: 'markdown-code-block',
	MarkdownCallingJSFile: 'markdown-calling-js-file',
	MarkdownOther: 'markdown-other',
	JSFile: 'js-file',
	Unknown: 'unknown',
} as const;

export type ExecutionSource = (typeof ExecutionSource)[keyof typeof ExecutionSource];

export interface Block {
	from: number;
	to: number;
}

export interface MarkdownCodeBlockExecutionContext {
	executionSource: typeof ExecutionSource.MarkdownCodeBlock;
	file?: TFile;
	metadata?: CachedMetadata | undefined;
	block?: Block | undefined;
}

export interface MarkdownCallingJSFileExecutionContext {
	executionSource: typeof ExecutionSource.MarkdownCallingJSFile;
	file?: TFile;
	metadata?: CachedMetadata | undefined;
	jsFile: TFile;
}

export interface MarkdownOtherExecutionContext {
	executionSource: typeof ExecutionSource.MarkdownOther;
	file?: TFile;
	metadata?: CachedMetadata | undefined;
}

export interface JSFileExecutionContext {
	executionSource: typeof ExecutionSource.JSFile;
	file: undefined;
	jsFile: TFile;
}

export interface UnknownExecutionContext {
	executionSource: typeof ExecutionSource.Unknown;
	file?: TFile | undefined;
}

export type ExecutionContext =
	| MarkdownCodeBlockExecutionContext
	| MarkdownCallingJSFileExecutionContext
	| MarkdownOtherExecutionContext
	| JSFileExecutionContext
	| UnknownExecutionContext;

export interface EngineExecutionParams {
	code: string;
	component: Component;
	container?: HTMLElement | undefined;
	context: ExecutionContext;
	contextOverrides?: Record<string, unknown> | undefined;
	expression?: boolean | undefined;
}

export type ExecuteFileEngineExecutionParams = Omit<EngineExecutionParams, 'code' | 'context'> & {
	context?: JSFileExecutionContext | MarkdownCallingJSFileExecutionContext;
};

export type ExecuteFileSimpleEngineExecutionParams = Omit<EngineExecutionParams, 'code' | 'component' | 'context'> & {
	context?: JSFileExecutionContext | MarkdownCallingJSFileExecutionContext;
};

export interface JsExecutionGlobals {
	app: App;
	engine: JsEngineApi;
	component: Component;
	context: ExecutionContext & Record<string, unknown>;
	container: HTMLElement | undefined;
	obsidian: typeof Obsidian;
}

export interface JsExecutionGlobalsConstructionOptions {
	engine?: JsEngineApi;
	component: Component;
	context: ExecutionContext & Record<string, unknown>;
	container?: HTMLElement | undefined;
}

export const MessageType = {
	INFO: 'info',
	TIP: 'tip',
	SUCCESS: 'success',
	WANING: 'warning',
	ERROR: 'error',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface Message {
	type: MessageType;
	title: string;
	content: string;
	code: string;
}

export interface MessageWrapper {
	uuid: string;
	source: unknown;
	message: Message;
	time: unknown;
}

export interface JsExecution {
	readonly globals: JsExecutionGlobals;
	readonly uuid: string;
	readonly code: string;
	readonly expression: boolean;
	result: unknown;
	functionBuildError: Error | undefined;
	functionRunError: Error | undefined;
	functionBuildTime: number | undefined;
	functionRunTime: number | undefined;
	isSuccessful(): boolean;
	getMessages(): MessageWrapper[];
	openStatsModal(): void;
}

export interface ResultRenderer {
	render(value: unknown): Promise<void>;
	convertToSimpleObject(value: unknown): unknown;
}

export interface JsEngineInternalApi {
	execute(params: EngineExecutionParams): Promise<JsExecution>;
	executeCustom(code: string, globals: Record<string, unknown>, expression?: boolean): Promise<unknown>;
	createRenderer(container: HTMLElement, sourcePath: string, component: Component): ResultRenderer;
	executeFile(path: string, params: ExecuteFileEngineExecutionParams): Promise<JsExecution>;
	executeFileSimple(path: string, params?: ExecuteFileSimpleEngineExecutionParams): Promise<JsExecution>;
	getContextForFile(path: string): Promise<ExecutionContext>;
	getContextForMarkdownCodeBlock(path: string): Promise<MarkdownCodeBlockExecutionContext>;
	getContextForMarkdownCallingJSFile(markdownPath: string, jsPath: string): Promise<MarkdownCallingJSFileExecutionContext>;
	getContextForMarkdownOther(path: string): Promise<MarkdownOtherExecutionContext>;
	getContextForJSFile(path: string): Promise<JSFileExecutionContext>;
	getContextForUnknown(path?: string): Promise<UnknownExecutionContext>;
	createExecutionGlobals(options: JsExecutionGlobalsConstructionOptions): JsExecutionGlobals;
	executeStartupScripts(): Promise<void>;
}

export interface JsEngineApi {
	readonly internal: JsEngineInternalApi;
}

export interface JsEnginePlugin extends Plugin {
	api: JsEngineApi;
}

interface ObsidianPluginManager {
	getPlugin(pluginId: string): unknown;
}

export function getJsEnginePlugin(app: App): JsEnginePlugin | undefined {
	const plugin = (app as unknown as { plugins?: ObsidianPluginManager }).plugins?.getPlugin(JS_ENGINE_PLUGIN_ID);

	if (isJsEnginePlugin(plugin)) {
		return plugin;
	}

	return undefined;
}

export function getJsEngineApi(app: App): JsEngineApi | undefined {
	return getJsEnginePlugin(app)?.api;
}

export function getJsEngineInternalApi(app: App): JsEngineInternalApi | undefined {
	return getJsEngineApi(app)?.internal;
}

function isJsEnginePlugin(value: unknown): value is JsEnginePlugin {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Partial<JsEnginePlugin>;
	return typeof candidate.api?.internal?.execute === 'function';
}

import type { App, Component } from 'obsidian';
import { getJsEngineApi, getJsEngineInternalApi, getJsEnginePlugin, JS_ENGINE_PLUGIN_ID } from '@lemons_dev/obsidian-js-engine-api';
import { ExecutionSource, MessageType } from '@lemons_dev/obsidian-js-engine-api';
import type {
	EngineExecutionParams,
	ExecutionContext,
	JsEngineApi,
	JsEngineInternalApi,
	JsExecution,
	Message,
	ResultRenderer,
} from '@lemons_dev/obsidian-js-engine-api';

declare const app: App;
declare const component: Component;
declare const container: HTMLElement;

const plugin = getJsEnginePlugin(app);
const api = getJsEngineApi(app);
const internal = getJsEngineInternalApi(app);

if (plugin !== undefined) {
	const pluginApi: JsEngineApi = plugin.api;
	void pluginApi.internal.executeStartupScripts();
}

if (api !== undefined) {
	const publicApi: JsEngineApi = api;
	void publicApi.internal.getContextForUnknown();
}

if (internal !== undefined) {
	const publicInternal: JsEngineInternalApi = internal;
	const unknownContext = await publicInternal.getContextForUnknown('Daily.md');
	const markdownContext = await publicInternal.getContextForMarkdownCodeBlock('Daily.md');
	const jsContext = await publicInternal.getContextForJSFile('Scripts/example.js');
	const renderer: ResultRenderer = publicInternal.createRenderer(container, 'Daily.md', component);

	const params: EngineExecutionParams = {
		code: 'return context.path;',
		component,
		container,
		context: unknownContext,
		contextOverrides: {
			path: 'Daily.md',
		},
		expression: false,
	};

	const execution: JsExecution = await publicInternal.execute(params);
	const fileExecution: JsExecution = await publicInternal.executeFile('Scripts/example.js', {
		component,
		context: jsContext,
	});
	const simpleExecution: JsExecution = await publicInternal.executeFileSimple('Scripts/example.js', {
		context: jsContext,
	});

	execution.isSuccessful();
	execution.getMessages();
	execution.openStatsModal();
	await renderer.render(simpleExecution.result);
	renderer.convertToSimpleObject(fileExecution.result);

	void markdownContext.metadata;
}

const context: ExecutionContext = {
	executionSource: ExecutionSource.Unknown,
};

const message: Message = {
	type: MessageType.INFO,
	title: JS_ENGINE_PLUGIN_ID,
	content: 'Ready',
	code: '',
};

void context;
void message;

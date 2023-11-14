import { type App, type Component } from 'obsidian';
import type JsEnginePlugin from '../main';
import { type ExecutionArgument, type ExecutionContext } from '../ArgumentManager';
import { MessageType, type MessageWrapper } from '../messages/MessageManager';
import { API } from '../api/API';
import { InstanceId, InstanceType } from '../api/InstanceId';

const AsyncFunction = async function (): Promise<void> {}.constructor;

export type JsFunc = (...args: unknown[]) => Promise<unknown>;

export interface JsExecutionParams {
	app: App;
	plugin: JsEnginePlugin;
	code: string;
	component: Component;
	container?: HTMLElement | undefined;
	context?: ExecutionContext | undefined;
	contextOverrides?: Record<string, unknown> | undefined;
}

export class JsExecution {
	readonly app: App;
	readonly plugin: JsEnginePlugin;

	uuid: string;
	code: string;
	args: ExecutionArgument[];
	context: ExecutionContext & Record<string, unknown>;
	apiInstance: API;
	messages: MessageWrapper[];

	func: JsFunc | undefined;
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

		this.args = [
			{
				key: 'app',
				value: this.app,
			},
			{
				key: 'engine',
				value: this.apiInstance,
			},
			{
				key: 'context',
				value: this.context,
			},
			{
				key: 'component',
				value: params.component,
			},
			{
				key: 'container',
				value: params.container,
			},
		];
	}

	buildFunction(): void {
		const startTime = performance.now();

		try {
			this.func = AsyncFunction(...this.args.map(x => x.key), this.code) as JsFunc;
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

	async runFunction(): Promise<void> {
		if (this.functionBuildError) {
			throw new Error('can not run function, function construction failed');
		}

		if (!this.func) {
			throw new Error('can not run function, function has not been constructed yet');
		}

		const startTime = performance.now();

		try {
			this.result = await Promise.resolve(this.func(...this.args.map(x => x.value)));
		} catch (e) {
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

	isSuccessful(): boolean {
		return !this.functionBuildError && !this.functionRunError;
	}

	getMessages(): MessageWrapper[] {
		return this.messages;
	}

	openStatsModal(): void {
		this.plugin.jsEngine.openExecutionStatsModal(this);
	}
}

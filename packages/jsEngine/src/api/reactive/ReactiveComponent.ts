import type { API } from 'packages/jsEngine/src/api/API';
import type { JsFunc } from 'packages/jsEngine/src/engine/JsExecution';
import type { ResultRenderer } from 'packages/jsEngine/src/engine/ResultRenderer';
import { MessageType } from 'packages/jsEngine/src/messages/MessageManager';

/**
 * A reactive component is a component that can be refreshed.
 * This is useful for rendering dynamic content.
 *
 * See {@link API.reactive}
 */
export class ReactiveComponent {
	private readonly apiInstance: API;
	private readonly _render: JsFunc;
	private readonly initialArgs: unknown[];
	/**
	 * @internal
	 */
	renderer: ResultRenderer | undefined;

	constructor(api: API, _render: JsFunc, initialArgs: unknown[]) {
		this.apiInstance = api;
		this._render = _render;
		this.initialArgs = initialArgs;
	}

	/**
	 * Refreshes the component by rerunning the render function with the arguments passed into this function.
	 *
	 * @param args
	 */
	public async refresh(...args: unknown[]): Promise<void> {
		let result: unknown;

		try {
			result = await this._render(...args);
		} catch (e) {
			console.warn('failed to execute JS', e);

			if (e instanceof Error) {
				result = this.apiInstance.message.createMessage(
					MessageType.ERROR,
					'Failed to execute JS',
					`Failed to execute JS during reactive execution in execution "${this.apiInstance.instanceId.id}"`,
					e.stack,
				);
			}
		}

		void this.renderer?.render(result);
	}

	/**
	 * @internal
	 */
	public initialRender(): void {
		void this.refresh(...this.initialArgs);
	}

	/**
	 * @internal
	 */
	public setRenderer(renderer: ResultRenderer): void {
		this.renderer = renderer;
	}
}

import { type ResultRenderer } from '../../engine/ResultRenderer';
import { type JsFunc } from '../../engine/JsExecution';
import { MessageType } from 'jsEngine/messages/MessageManager';
import { type API } from 'jsEngine/api/API';

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
			// eslint-disable-next-line
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

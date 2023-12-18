import { type ResultRenderer } from '../../engine/ResultRenderer';
import { type JsFunc } from '../../engine/JsExecution';

/**
 * A reactive component is a component that can be refreshed.
 * This is useful for rendering dynamic content.
 *
 * See {@link API.reactive}
 */
export class ReactiveComponent {
	private readonly _render: JsFunc;
	private readonly initialArgs: unknown[];
	/**
	 * @internal
	 */
	renderer: ResultRenderer | undefined;

	constructor(_render: JsFunc, initialArgs: unknown[]) {
		this._render = _render;
		this.initialArgs = initialArgs;
	}

	/**
	 * Refreshes the component by rerunning the render function with the arguments passed into this function.
	 *
	 * @param args
	 */
	public async refresh(...args: unknown[]): Promise<void> {
		void this.renderer?.render(await this._render(...args));
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

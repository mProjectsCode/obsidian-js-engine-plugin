import { type ResultRenderer } from '../../ResultRenderer';
import { type JsFunc } from '../../engine/JsExecution';

export class ReactiveComponent {
	readonly _render: JsFunc;
	readonly initialArgs: unknown[];
	renderer: ResultRenderer | undefined;

	constructor(_render: JsFunc, initialArgs: unknown[]) {
		this._render = _render;
		this.initialArgs = initialArgs;
	}

	public async refresh(...args: unknown[]): Promise<void> {
		void this.renderer?.render(await this._render(...args));
	}

	public initialRender(): void {
		void this.refresh(...this.initialArgs);
	}

	public setRenderer(renderer: ResultRenderer): void {
		this.renderer = renderer;
	}
}

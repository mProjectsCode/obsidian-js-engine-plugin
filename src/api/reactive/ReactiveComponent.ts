import { ResultRenderer } from '../../ResultRenderer';

export type ReactiveRenderFunction = (...args: any[]) => unknown;

export class ReactiveComponent {
	readonly _render: ReactiveRenderFunction;
	readonly initialArgs: any[];
	renderer: ResultRenderer | undefined;

	constructor(_render: ReactiveRenderFunction, initialArgs: any[]) {
		this._render = _render;
		this.initialArgs = initialArgs;
	}

	public refresh(...args: any[]): void {
		this.renderer?.render(this._render(...args));
	}

	public initialRender(): void {
		this.refresh(...this.initialArgs);
	}

	public setRenderer(renderer: ResultRenderer): void {
		this.renderer = renderer;
	}
}

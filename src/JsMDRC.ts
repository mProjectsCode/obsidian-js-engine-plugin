import { MarkdownRenderChild, TAbstractFile, TFile, MarkdownPostProcessorContext } from 'obsidian';
import JsEnginePlugin from './main';
import {ExecutionArgument, ExecutionContext} from './ArgumentManager';
import { MarkdownBuilder } from './api/markdown/MarkdownBuilder';
import {MarkdownString} from './api/markdown/MarkdownString';

export class JsMDRC extends MarkdownRenderChild {
	plugin: JsEnginePlugin;
	content: string;
	ctx: MarkdownPostProcessorContext;

	constructor(containerEl: HTMLElement, plugin: JsEnginePlugin, content: string, ctx: MarkdownPostProcessorContext) {
		super(containerEl);
		this.plugin = plugin;
		this.content = content;
		this.ctx = ctx;
	}

	getExecutionFile(): TFile | undefined {
		if (!this.ctx.sourcePath) {
			return undefined;
		}

		const abstractFile: TAbstractFile | null = this.plugin.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
		if (!abstractFile) {
			return undefined;
		}

		if (abstractFile instanceof TFile) {
			return abstractFile;
		} else {
			return undefined;
		}
	}

	buildExecutionContext(): ExecutionContext {
		return {
			file: this.getExecutionFile(),
		};
	}

	buildExecutionArgs(container: HTMLElement): ExecutionArgument[] {
		if (!this.plugin.jsEngine) {
			throw new Error("jsEngine is undefined");
		}
		return this.plugin.jsEngine?.argsManager.constructArgs(this.buildExecutionContext(), this, container);
	}

	async tryRun(args: ExecutionArgument[]): Promise<unknown> {
		if (!this.plugin.jsEngine) {
			throw new Error("jsEngine is undefined");
		}

		return this.plugin.jsEngine.execute(this.content, args);
	}

	async tryRender(container: HTMLElement): Promise<void> {
		const args = this.buildExecutionArgs(container);
		let res = await this.tryRun(args);

		if (!res) {
			return;
		}

		if (typeof res === 'string') {
			container.innerText = res;
			return;
		}

		if (res instanceof MarkdownBuilder) {
			res = res.toMarkdown();
		}

		if (res instanceof MarkdownString) {
			console.log(res.content);
			await res.render(container, this.ctx.sourcePath, this);
		}

		if (res instanceof HTMLElement) {
			container.append(res);
		}
	}

	async onload(): Promise<void> {
		console.log('load');

		this.containerEl.empty();

		try {
			await this.tryRender(this.containerEl);
		} catch (e) {
			this.containerEl.innerText = e instanceof Error ? e.stack?.toString() ?? '' : (e as string);
			this.containerEl.addClass("mod-warning");
		}
	}

	onunload(): void {
		console.log('unload');
	}
}

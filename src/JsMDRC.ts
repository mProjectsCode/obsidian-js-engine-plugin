import { MarkdownRenderChild, MarkdownRenderer, TAbstractFile, TFile } from 'obsidian';
import JsEnginePlugin from './main';
import { MarkdownPostProcessorContext } from 'obsidian/publish';
import { ExecutionContext } from './ArgumentManager';
import { MarkdownBuilder } from './markdownBuilder/MarkdownBuilder';
import { MarkdownString } from './api/MarkdownAPI';

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

	async tryRun(): Promise<unknown> {
		if (!this.plugin.jsEngine) {
			return;
		}

		return this.plugin.jsEngine.execute(this.content, this.buildExecutionContext());
	}

	async tryRender(container: HTMLElement): Promise<void> {
		let res = await this.tryRun();

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
			console.log(e);
		}
	}

	onunload(): void {
		console.log('unload');
	}
}

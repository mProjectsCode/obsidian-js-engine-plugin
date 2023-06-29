import {MarkdownRenderChild, MarkdownRenderer, TAbstractFile, TFile} from 'obsidian';
import JsEnginePlugin from './main';
import {MarkdownPostProcessorContext} from 'obsidian/publish';
import {ExecutionContext} from './ArgumentManager';
import {MarkdownBuilder} from './markdownBuilder/MarkdownBuilder';

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
		}
	}

	async tryRun(): Promise<unknown> {
		if (!this.plugin.jsEngine) {
			return;
		}

		return this.plugin.jsEngine.execute(this.content, this.buildExecutionContext());
	}

	async tryRender(container: HTMLElement): Promise<void> {
		const res = await this.tryRun();

		if (!res) {
			return;
		}

		if (typeof res === 'string') {
			container.innerText = res;
			return;
		}

		if (res instanceof MarkdownBuilder) {
			console.log(res.toMarkdown());
			await MarkdownRenderer.renderMarkdown(res.toMarkdown(), container, this.ctx.sourcePath, this);
			return;
		}

	}

	async onload(): Promise<void> {
		console.log('load');

		this.containerEl.empty()

		try {
			await this.tryRender(this.containerEl)
		} catch (e) {
			this.containerEl.innerText = e as string;
		}
	}

	onunload(): void {
		console.log('unload');
	}
}

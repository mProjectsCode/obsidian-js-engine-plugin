import type { ExecutionContext, JsExecution } from 'jsEngine/engine/JsExecution';
import { ExecutionSource } from 'jsEngine/engine/JsExecution';
import { ResultRenderer } from 'jsEngine/engine/ResultRenderer';
import type JsEnginePlugin from 'jsEngine/main';
import type { MarkdownPostProcessorContext, TAbstractFile } from 'obsidian';
import { MarkdownRenderChild, Menu, setIcon, TFile } from 'obsidian';

export class JsMDRC extends MarkdownRenderChild {
	plugin: JsEnginePlugin;
	content: string;
	ctx: MarkdownPostProcessorContext;
	jsExecution: JsExecution | undefined;
	debugMode: boolean;

	constructor(containerEl: HTMLElement, plugin: JsEnginePlugin, content: string, debugMode: boolean, ctx: MarkdownPostProcessorContext) {
		super(containerEl);
		this.plugin = plugin;
		this.content = content;
		this.debugMode = debugMode;
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
		const file = this.getExecutionFile();
		const metadata = file ? (this.plugin.app.metadataCache.getFileCache(file) ?? undefined) : undefined;

		return {
			executionSource: ExecutionSource.MarkdownCodeBlock,
			file: file,
			metadata: metadata,
			block: undefined,
		};
	}

	async tryRun(context: ExecutionContext): Promise<JsExecution> {
		return this.plugin.jsEngine.execute({
			code: this.content,
			context: context,
			contextOverrides: {},
			component: this,
			container: this.containerEl,
		});
	}

	async renderResults(container: HTMLElement): Promise<void> {
		const context = this.buildExecutionContext();

		this.jsExecution = await this.tryRun(context);
		const result = this.jsExecution.result;

		const renderer = new ResultRenderer(this.plugin, container, this.ctx.sourcePath, this);
		await renderer.render(result);
	}

	renderExecutionStats(container: HTMLElement): void {
		if (!this.debugMode) {
			return;
		}

		const menu = new Menu();
		menu.addItem(item => {
			item.setTitle('Info');
			item.setIcon('info');
			item.onClick(() => {
				this.jsExecution?.openStatsModal();
			});
		});

		menu.addItem(item => {
			item.setTitle('Rerun');
			item.setIcon('rotate-ccw');
			item.onClick(() => {
				void this.render();
			});
		});

		const statsContainer = container.createDiv();

		statsContainer.addClass('js-engine-execution-stats-button');
		statsContainer.addEventListener('click', evt => {
			menu.showAtMouseEvent(evt);
		});
		setIcon(statsContainer, 'info');
	}

	async render(): Promise<void> {
		this.containerEl.empty();

		if (!this.containerEl.hasClass('js-engine-execution-render-child')) {
			this.containerEl.addClass('js-engine-execution-render-child');
		}

		try {
			await this.renderResults(this.containerEl);
			this.renderExecutionStats(this.containerEl);
		} catch (e) {
			this.containerEl.innerText = e instanceof Error ? (e.stack?.toString() ?? '') : (e as string);
			this.containerEl.addClass('mod-warning');
		}
	}

	onload(): void {
		// console.log('load');

		void this.render();
	}

	onunload(): void {
		// console.log('unload');
	}
}

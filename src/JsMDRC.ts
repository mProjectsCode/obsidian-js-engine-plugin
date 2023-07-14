import { MarkdownPostProcessorContext, MarkdownRenderChild, setIcon, TAbstractFile, TFile } from 'obsidian';
import JsEnginePlugin from './main';
import { ExecutionArgument, ExecutionContext } from './ArgumentManager';
import { MarkdownBuilder } from './api/markdown/MarkdownBuilder';
import { MarkdownString } from './api/markdown/MarkdownString';
import { MessageWrapper } from './messages/MessageManager';
import MessageComponent from './messages/MessageComponent.svelte';

import { JsExecution } from './jsEngine/JsExecution';

export class JsMDRC extends MarkdownRenderChild {
	plugin: JsEnginePlugin;
	content: string;
	ctx: MarkdownPostProcessorContext;
	jsExecution: JsExecution | undefined;

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
		console.log(this.ctx);
		return {
			file: this.getExecutionFile()!,
			line: 0,
		};
	}

	buildExecutionArgs(container: HTMLElement): ExecutionArgument[] {
		return [
			{
				key: 'component',
				value: this,
			},
			{
				key: 'container',
				value: container,
			},
		];
	}

	async tryRun(args: ExecutionArgument[], context: ExecutionContext): Promise<JsExecution> {
		return this.plugin.jsEngine.execute(this.content, args, context);
	}

	async tryRender(container: HTMLElement): Promise<void> {
		const args = this.buildExecutionArgs(container);
		const context = this.buildExecutionContext();
		this.jsExecution = await this.tryRun(args, context);
		let result = this.jsExecution.result;

		if (!result) {
			return;
		}

		this.renderExecutionStats(container);

		if (typeof result === 'string') {
			container.innerText = result;
			return;
		}

		if (result instanceof MarkdownBuilder) {
			result = result.toMarkdown();
		}

		if (result instanceof MarkdownString) {
			console.log(result.content);
			await result.render(container, this.ctx.sourcePath, this);
			return;
		}

		if (result instanceof HTMLElement) {
			container.append(result);
		}

		if (result instanceof MessageWrapper) {
			new MessageComponent({
				target: container,
				props: {
					messageWrapper: result,
					messageManager: this.plugin.messageManager,
					showDeleteButton: false,
					showMessageSource: false,
				},
			});
		}
	}

	renderExecutionStats(container: HTMLElement): void {
		const statsContainer = container.createDiv();

		statsContainer.addClass('js-engine-execution-stats-button');
		statsContainer.addEventListener('click', () => {
			this.jsExecution?.openStatsModal();
		});
		setIcon(statsContainer, 'info');
	}

	async onload(): Promise<void> {
		console.log('load');

		this.containerEl.empty();

		this.containerEl.addClass('js-engine-execution-render-child');

		try {
			await this.tryRender(this.containerEl);
		} catch (e) {
			this.containerEl.innerText = e instanceof Error ? e.stack?.toString() ?? '' : (e as string);
			this.containerEl.addClass('mod-warning');
		}
	}

	onunload(): void {
		console.log('unload');
	}
}

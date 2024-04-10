import { type App, Modal } from 'obsidian';
import type JsEnginePlugin from '../main';
import ExecutionStatsComponent from './ExecutionStatsComponent.svelte';
import { type JsExecution } from './JsExecution';

/**
 * @internal
 */
export class ExecutionStatsModal extends Modal {
	private readonly plugin: JsEnginePlugin;
	private component: ExecutionStatsComponent | undefined;
	private execution: JsExecution | undefined;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app);
		this.plugin = plugin;
	}

	setExecution(execution: JsExecution): void {
		this.execution = execution;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}

		if (!this.contentEl.hasClass('js-engine-execution-stats-modal')) {
			this.contentEl.addClass('js-engine-execution-stats-modal');
		}

		if (this.execution === undefined) {
			this.contentEl.createEl('p', { cls: 'mod-warning', text: 'No execution data available.' });
			return;
		}

		this.component = new ExecutionStatsComponent({
			target: this.contentEl,
			props: {
				execution: this.execution,
			},
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}
	}
}

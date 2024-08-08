import { type App, Modal } from 'obsidian';
import type JsEnginePlugin from 'jsEngine/main';
import ExecutionStatsComponent from 'jsEngine/engine/ExecutionStatsComponent.svelte';
import { type JsExecution } from 'jsEngine/engine/JsExecution';
import { unmount } from 'svelte';
import { customMount, type MountedComponent } from 'jsEngine/utils/SvelteUtils';

/**
 * @internal
 */
export class ExecutionStatsModal extends Modal {
	private readonly plugin: JsEnginePlugin;
	private component: MountedComponent<ExecutionStatsComponent> | undefined;
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
			unmount(this.component);
		}

		if (!this.contentEl.hasClass('js-engine-execution-stats-modal')) {
			this.contentEl.addClass('js-engine-execution-stats-modal');
		}

		if (this.execution === undefined) {
			this.contentEl.createEl('p', { cls: 'mod-warning', text: 'No execution data available.' });
			return;
		}

		this.component = customMount(ExecutionStatsComponent, this.contentEl, {
			execution: this.execution,
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			unmount(this.component);
		}
	}
}

import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import ExecutionStatsComponent from 'packages/jsEngine/src/engine/ExecutionStatsComponent.svelte';
import type { JsExecution } from 'packages/jsEngine/src/engine/JsExecution';
import type JsEnginePlugin from 'packages/jsEngine/src/main';
import type { MountedComponent } from 'packages/jsEngine/src/utils/SvelteUtils';
import { mount, unmount } from 'svelte';

/**
 * @internal
 */
export class ExecutionStatsModal extends Modal {
	private readonly plugin: JsEnginePlugin;
	private component: MountedComponent<typeof ExecutionStatsComponent> | undefined;
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
			void unmount(this.component);
		}

		if (!this.contentEl.hasClass('js-engine-execution-stats-modal')) {
			this.contentEl.addClass('js-engine-execution-stats-modal');
		}

		if (this.execution === undefined) {
			this.contentEl.createEl('p', { cls: 'mod-warning', text: 'No execution data available.' });
			return;
		}

		this.component = mount(ExecutionStatsComponent, {
			target: this.contentEl,
			props: {
				execution: this.execution,
			},
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			void unmount(this.component);
		}
	}
}

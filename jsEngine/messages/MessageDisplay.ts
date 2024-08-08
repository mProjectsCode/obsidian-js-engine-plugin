import { type App, Modal } from 'obsidian';
import type JsEnginePlugin from 'jsEngine/main';
import MessageDisplayComponent from 'jsEngine/messages/MessageDisplayComponent.svelte';
import { unmount } from 'svelte';
import { customMount, type MountedComponent } from 'jsEngine/utils/SvelteUtils';

export class MessageDisplay extends Modal {
	/**
	 * Reference the JS Engine plugin.
	 */
	private readonly plugin: JsEnginePlugin;
	private component: MountedComponent<MessageDisplayComponent> | undefined;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			unmount(this.component);
		}

		this.component = customMount<MessageDisplayComponent>(MessageDisplayComponent, this.contentEl, {
			messageManager: this.plugin.messageManager,
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			unmount(this.component);
		}
	}
}

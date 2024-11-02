import type JsEnginePlugin from 'jsEngine/main';
import MessageDisplayComponent from 'jsEngine/messages/MessageDisplayComponent.svelte';
import type { MountedComponent } from 'jsEngine/utils/SvelteUtils';
import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import { mount, unmount } from 'svelte';

export class MessageDisplay extends Modal {
	/**
	 * Reference the JS Engine plugin.
	 */
	private readonly plugin: JsEnginePlugin;
	private component: MountedComponent<typeof MessageDisplayComponent> | undefined;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			unmount(this.component);
		}

		this.component = mount(MessageDisplayComponent, {
			target: this.contentEl,
			props: {
				messageManager: this.plugin.messageManager,
			},
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			unmount(this.component);
		}
	}
}

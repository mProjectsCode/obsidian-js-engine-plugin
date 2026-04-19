import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type JsEnginePlugin from 'packages/jsEngine/src/main';
import MessageDisplayComponent from 'packages/jsEngine/src/messages/MessageDisplayComponent.svelte';
import type { MountedComponent } from 'packages/jsEngine/src/utils/SvelteUtils';
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
			void unmount(this.component);
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
			void unmount(this.component);
		}
	}
}

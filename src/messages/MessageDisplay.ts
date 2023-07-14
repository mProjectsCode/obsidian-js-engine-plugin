import { App, Modal } from 'obsidian';
import JsEnginePlugin from '../main';
import MessageDisplayComponent from './MessageDisplayComponent.svelte';

export class MessageDisplay extends Modal {
	/**
	 * Reference the JS Engine plugin.
	 */
	private readonly plugin: JsEnginePlugin;
	private component: MessageDisplayComponent | undefined;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}

		this.component = new MessageDisplayComponent({
			target: this.contentEl,
			props: {
				messageManager: this.plugin.messageManager,
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

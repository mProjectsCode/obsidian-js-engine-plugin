import { MarkdownBuilder } from './api/markdown/MarkdownBuilder';
import { MarkdownString } from './api/markdown/MarkdownString';
import { MessageWrapper } from './messages/MessageManager';
import MessageComponent from './messages/MessageComponent.svelte';
import { Component } from 'obsidian';
import JsEnginePlugin from './main';
import { ReactiveComponent } from './api/reactive/ReactiveComponent';

export class ResultRenderer {
	readonly plugin: JsEnginePlugin;
	readonly container: HTMLElement;
	readonly sourcePath: string;
	readonly component: Component;

	constructor(plugin: JsEnginePlugin, container: HTMLElement, sourcePath: string, component: Component) {
		this.plugin = plugin;
		this.container = container;
		this.sourcePath = sourcePath;
		this.component = component;
	}

	public async render(content: unknown): Promise<void> {
		if (content == null) {
			return;
		}

		this.container.empty();

		if (typeof content === 'string') {
			this.container.innerText = content;
			return;
		}

		if (content instanceof MarkdownBuilder) {
			content = content.toMarkdown();
		}

		if (content instanceof MarkdownString) {
			console.log(content.content);
			await content.render(this.container, this.sourcePath, this.component);
			return;
		}

		if (content instanceof HTMLElement) {
			this.container.append(content);
			return;
		}

		if (content instanceof MessageWrapper) {
			new MessageComponent({
				target: this.container,
				props: {
					messageWrapper: content,
					messageManager: this.plugin.messageManager,
					showDeleteButton: false,
					showMessageSource: false,
				},
			});
			return;
		}

		if (content instanceof ReactiveComponent) {
			content.setRenderer(this);
			content.initialRender();
			return;
		}

		this.container.innerText = JSON.stringify(content);
	}
}

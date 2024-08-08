import { MarkdownBuilder } from 'jsEngine/api/markdown/MarkdownBuilder';
import { MarkdownString } from 'jsEngine/api/markdown/MarkdownString';
import { MessageWrapper } from 'jsEngine/messages/MessageManager';
import MessageComponent from 'jsEngine/messages/MessageComponent.svelte';
import { type Component } from 'obsidian';
import type JsEnginePlugin from 'jsEngine/main';
import { ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import { mount, unmount } from 'svelte';

/**
 * Attaches to a container and renders values.
 * Used to render the result of a {@link JsExecution}.
 */
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

	/**
	 * Renders the given value to the container.
	 *
	 * @param value The value to render.
	 */
	async render(value: unknown): Promise<void> {
		if (value == null) {
			return;
		}

		this.container.empty();

		if (typeof value === 'string') {
			this.container.innerText = value;
			return;
		}

		if (value instanceof MarkdownBuilder) {
			value = value.toMarkdown();
		}

		if (value instanceof MarkdownString) {
			// console.log('js-engine | Rendering Markdown String\n', value.content);
			await value.render(this.plugin.app, this.container, this.sourcePath, this.component);
			return;
		}

		if (value instanceof HTMLElement) {
			this.container.append(value);
			return;
		}

		if (value instanceof MessageWrapper) {
			const svelteComponent = mount(MessageComponent, {
				target: this.container,
				props: {
					messageWrapper: value,
					messageManager: this.plugin.messageManager,
					showDeleteButton: false,
					showMessageSource: false,
				},
			});
			
			this.component.register(() => {
				unmount(svelteComponent);
			})
			return;
		}

		if (value instanceof ReactiveComponent) {
			value.setRenderer(this);
			value.initialRender();
			return;
		}

		this.container.innerText = JSON.stringify(value);
	}

	/**
	 * Converts the given value to a simple object.
	 * E.g. a {@link MarkdownBuilder} will be converted to a string.
	 *
	 * @param value The value to convert.
	 * @returns The simple object.
	 */
	convertToSimpleObject(value: unknown): unknown {
		if (value instanceof MarkdownBuilder) {
			return value.toMarkdown().content;
		}

		if (value instanceof MarkdownString) {
			return value.content;
		}

		if (value instanceof HTMLElement) {
			return value.outerHTML;
		}

		if (value instanceof MessageWrapper) {
			return value.message;
		}

		return value;
	}
}

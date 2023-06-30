import {Component, MarkdownRenderer} from 'obsidian';

export class MarkdownString {
	content: string;

	constructor(content: string) {
		this.content = content;
	}

	async render(element: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		await MarkdownRenderer.renderMarkdown(this.content, element, sourcePath, component);
	}
}

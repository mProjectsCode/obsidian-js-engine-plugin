import { type App, type Component, MarkdownRenderer } from 'obsidian';

/**
 * A string that should be rendered as markdown by the plugin.
 */
export class MarkdownString {
	readonly content: string;

	constructor(content: string) {
		this.content = content;
	}

	/**
	 * @internal
	 */
	async render(app: App, element: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		await MarkdownRenderer.render(app, this.content, element, sourcePath, component);
	}
}

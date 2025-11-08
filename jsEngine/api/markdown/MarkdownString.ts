import type { API } from 'jsEngine/api/API';
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import type { Component } from 'obsidian';
import { App } from 'obsidian';
import { MarkdownRenderer } from 'obsidian';
import * as z from 'zod';

/**
 * A string that should be rendered as markdown by the plugin.
 */
export class MarkdownString {
	readonly content: string;
	readonly apiInstance: API;

	constructor(apiInstance: API, content: string) {
		this.apiInstance = apiInstance;
		this.content = content;
	}

	/**
	 * @internal
	 */
	async render(app: App, element: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		validateAPIArgs(
			z.object({
				app: z.instanceof(App),
				element: this.apiInstance.validators.htmlElement,
				sourcePath: z.string(),
				component: this.apiInstance.validators.component,
			}),
			{ app, element, sourcePath, component },
		);

		await MarkdownRenderer.render(app, this.content, element, sourcePath, component);
	}
}

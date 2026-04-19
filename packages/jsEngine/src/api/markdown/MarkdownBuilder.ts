import type { API } from 'packages/jsEngine/src/api/API';
import type { AbstractMarkdownElement } from 'packages/jsEngine/src/api/markdown/AbstractMarkdownElement';
import { AbstractMarkdownElementContainer } from 'packages/jsEngine/src/api/markdown/AbstractMarkdownElementContainer';

/**
 * Allows for easily building markdown using JavaScript.
 */
export class MarkdownBuilder extends AbstractMarkdownElementContainer {
	constructor(apiInstance: API) {
		super(apiInstance);
	}

	public toString(): string {
		return this.markdownElements.map(x => x.toString()).join('\n\n');
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}
}

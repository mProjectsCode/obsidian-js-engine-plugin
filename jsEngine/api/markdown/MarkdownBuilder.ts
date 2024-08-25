import type { AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
import { AbstractMarkdownElementContainer } from 'jsEngine/api/markdown/AbstractMarkdownElementContainer';

/**
 * Allows for easily building markdown using JavaScript.
 */
export class MarkdownBuilder extends AbstractMarkdownElementContainer {
	constructor() {
		super();
	}

	public toString(): string {
		return this.markdownElements.map(x => x.toString()).join('\n\n');
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}
}

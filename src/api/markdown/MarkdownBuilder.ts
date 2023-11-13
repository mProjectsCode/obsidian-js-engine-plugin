import { AbstractMarkdownElementContainer } from './AbstractMarkdownElementContainer';
import { type AbstractMarkdownElement } from './AbstractMarkdownElement';

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

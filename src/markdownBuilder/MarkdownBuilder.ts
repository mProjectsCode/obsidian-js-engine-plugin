import {AbstractMarkdownElementContainer} from './AbstractMarkdownElementContainer';
import {AbstractMarkdownElement} from './AbstractMarkdownElement';

export class MarkdownBuilder extends AbstractMarkdownElementContainer{
	constructor() {
		super();
	}

	public toMarkdown(): string {
		return this.markdownElements.map(x => x.toMarkdown()).join('\n\n');
	}

	public allowElement(element: AbstractMarkdownElement): boolean {
		return true;
	}
}

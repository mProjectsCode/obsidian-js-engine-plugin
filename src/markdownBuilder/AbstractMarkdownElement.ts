import {MarkdownElementType} from './MarkdownElementType';

export abstract class AbstractMarkdownElement {
	abstract toMarkdown(): string;
	abstract getType(): MarkdownElementType;
}

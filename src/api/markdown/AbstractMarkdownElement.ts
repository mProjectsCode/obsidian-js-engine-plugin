import { MarkdownElementType } from './MarkdownElementType';
import { MarkdownString } from './MarkdownString';

export abstract class AbstractMarkdownElement {
	abstract toString(): string;

	abstract getType(): MarkdownElementType;

	toMarkdown(): MarkdownString {
		return new MarkdownString(this.toString());
	}
}

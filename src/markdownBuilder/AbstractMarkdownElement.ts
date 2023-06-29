import { MarkdownElementType } from './MarkdownElementType';
import { MarkdownString } from '../api/MarkdownAPI';

export abstract class AbstractMarkdownElement {
	abstract toString(): string;
	abstract getType(): MarkdownElementType;

	toMarkdown(): MarkdownString {
		return new MarkdownString(this.toString());
	}
}

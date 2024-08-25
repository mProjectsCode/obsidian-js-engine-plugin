import type { MarkdownElementType } from 'jsEngine/api/markdown/MarkdownElementType';
import { MarkdownString } from 'jsEngine/api/markdown/MarkdownString';

/**
 * @internal
 */
export abstract class AbstractMarkdownElement {
	/**
	 * Converts the element to a string.
	 */
	abstract toString(): string;

	/**
	 * @internal
	 */
	abstract getType(): MarkdownElementType;

	/**
	 * Converts the element to a {@link MarkdownString}.
	 */
	toMarkdown(): MarkdownString {
		return new MarkdownString(this.toString());
	}
}

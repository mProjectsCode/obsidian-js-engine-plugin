import { AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
import { MarkdownElementType } from 'jsEngine/api/markdown/MarkdownElementType';

/**
 * @internal
 */
export abstract class AbstractMarkdownLiteral extends AbstractMarkdownElement {
	public getType(): MarkdownElementType {
		return MarkdownElementType.LITERAL;
	}
}

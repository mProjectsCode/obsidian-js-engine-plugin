import { AbstractMarkdownElement } from './AbstractMarkdownElement';
import { MarkdownElementType } from './MarkdownElementType';

/**
 * @internal
 */
export abstract class AbstractMarkdownLiteral extends AbstractMarkdownElement {
	public getType(): MarkdownElementType {
		return MarkdownElementType.LITERAL;
	}
}

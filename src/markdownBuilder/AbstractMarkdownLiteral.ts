import { AbstractMarkdownElement } from './AbstractMarkdownElement';
import { MarkdownElementType } from './MarkdownElementType';

export abstract class AbstractMarkdownLiteral extends AbstractMarkdownElement {
	public getType(): MarkdownElementType {
		return MarkdownElementType.LITERAL;
	}
}

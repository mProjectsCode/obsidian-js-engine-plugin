import { AbstractMarkdownElement } from 'packages/jsEngine/src/api/markdown/AbstractMarkdownElement';
import { MarkdownElementType } from 'packages/jsEngine/src/api/markdown/MarkdownElementType';

export abstract class AbstractMarkdownLiteral extends AbstractMarkdownElement {
	public getType(): MarkdownElementType {
		return MarkdownElementType.LITERAL;
	}
}
